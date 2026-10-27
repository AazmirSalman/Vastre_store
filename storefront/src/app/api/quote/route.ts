import { NextResponse } from 'next/server'
import { isSameOrigin, readJson } from '@/lib/origin'
import { parseCartLines, priceCart } from '@/lib/pricing'
import { clientIp, isLimited } from '@/lib/ratelimit'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  if (isLimited(`quote:${clientIp(req.headers)}`, 150, 60_000)) {
    return NextResponse.json({ error: 'Too many requests. Wait a minute and try again.' }, { status: 429 })
  }
  const body = await readJson(req)
  const lines = parseCartLines(body?.items)
  if (!lines) return NextResponse.json({ error: 'Invalid cart' }, { status: 400 })
  try {
    return NextResponse.json(await priceCart(lines), { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Could not load prices' }, { status: 502 })
  }
}
