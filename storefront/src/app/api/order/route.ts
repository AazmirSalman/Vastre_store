import { NextResponse } from 'next/server'
import { normalizePhone } from '@/lib/format'
import { isSameOrigin, readJson } from '@/lib/origin'
import { CUSTOM, parseCartLines, priceCart } from '@/lib/pricing'
import { alertOwner, ordersEnabled, saveOrder, sendWebhook, type OrderInput } from '@/lib/orders'
import { clientIp, isLimited } from '@/lib/ratelimit'

export const dynamic = 'force-dynamic'

const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'landing', 'referrer']

function text(v: unknown, max: number): string {
  return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : ''
}

function makeRef(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return 'VS-' + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: 'Not allowed' }, { status: 403 })

  const body = await readJson(req)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  // Hidden field that only bots fill in. Pretend it worked, send nothing.
  if (text(body.website, 100)) return NextResponse.json({ ref: makeRef(), quote: null })

  const c = (body.customer && typeof body.customer === 'object' ? body.customer : {}) as Record<string, unknown>
  const name = text(c.name, 80)
  const phone = normalizePhone(text(c.phone, 30))
  const city = text(c.city, 60)
  const address = text(c.address, 300)
  const measurements = text(c.measurements, 400)

  const fields: Record<string, string> = {}
  if (name.length < 2) fields.name = 'Enter your full name.'
  if (!phone) fields.phone = 'Enter a Pakistani mobile number, like 0300 1234567.'
  if (city.length < 2) fields.city = 'Enter your city.'
  if (address.length < 8) fields.address = 'Enter your full delivery address, with house number and area.'
  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ error: 'Check the highlighted fields.', fields }, { status: 422 })
  }

  const lines = parseCartLines(body.items)
  if (!lines) return NextResponse.json({ error: 'Your cart is empty or invalid.' }, { status: 400 })
  if (lines.some((l) => l.size === CUSTOM) && measurements.length < 5) {
    return NextResponse.json({ error: 'Check the highlighted fields.', fields: { measurements: 'Add your measurements for the custom size.' } }, { status: 422 })
  }

  let quote
  try {
    quote = await priceCart(lines, city)
  } catch {
    return NextResponse.json({ error: 'Could not check prices. Please try again.' }, { status: 502 })
  }
  if (!quote.allOk) {
    return NextResponse.json({ error: 'Some items in your cart need attention.', quote }, { status: 409 })
  }
  if (typeof body.expectedTotal === 'number' && body.expectedTotal !== quote.total) {
    return NextResponse.json({ error: 'Prices were updated. Check your total and place the order again.', quote }, { status: 409 })
  }

  if (!ordersEnabled()) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  // Only orders that would be saved count. Many customers share one mobile-carrier IP in Pakistan,
  // so the limit is generous and rejected or mistyped attempts never use it up.
  if (isLimited(`order:${clientIp(req.headers)}`, 12, 10 * 60_000)) {
    return NextResponse.json({ error: 'Too many orders from this connection. Please wait a few minutes.' }, { status: 429 })
  }

  const attribution: Record<string, string> = {}
  const a = (body.attribution && typeof body.attribution === 'object' ? body.attribution : {}) as Record<string, unknown>
  for (const k of ATTRIBUTION_KEYS) {
    const v = text(a[k], 200)
    if (v) attribution[k] = v
  }

  const ref = makeRef()
  const order: OrderInput = {
    ref,
    customer: { name, phone: phone || '', city, address, measurements, notes: text(c.notes, 300) },
    quote,
    attribution,
    paymentMethod: 'To be confirmed on call',
  }

  try {
    await saveOrder(order)
  } catch {
    await alertOwner(order, false)
    return NextResponse.json({ error: 'We could not save your order. Please send it to us on WhatsApp instead.', fallback: true }, { status: 502 })
  }
  await Promise.all([alertOwner(order, true), sendWebhook(order)])

  return NextResponse.json({ ref, quote })
}
