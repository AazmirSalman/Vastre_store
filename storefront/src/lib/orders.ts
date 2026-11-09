/**
 * Saving orders and alerting the owner. Server only.
 *
 * Orders go to the Sanity panel as private documents ("orders.<ref>": anything with a dot in its ID
 * needs a login to read, so customer details never show in the public store data).
 * Every order then rings the owner's phone through ntfy (free push app), with no personal details
 * in the alert itself: just the order number, total and city, and a link to the panel.
 *
 * Needs, in the host's environment variables:
 *   SANITY_WRITE_TOKEN  an Editor token from sanity.io/manage (required to take orders)
 *   NTFY_TOPIC          the secret alert channel name (optional; no alert without it)
 *   ORDERS_WEBHOOK_URL  optional extra copy, e.g. a Google Sheet (and ORDERS_WEBHOOK_SECRET)
 */
import { createClient } from '@sanity/client'
import { SANITY_DATASET, SANITY_PROJECT_ID, SITE_URL } from './config'
import { formatPKR } from './format'
import type { Quote } from './types'

export type OrderInput = {
  ref: string
  customer: { name: string; phone: string; city: string; address: string; measurements: string; notes: string }
  quote: Quote
  attribution: Record<string, string>
  paymentMethod: string
}

export function ordersEnabled(): boolean {
  return Boolean(process.env.SANITY_WRITE_TOKEN && SANITY_PROJECT_ID)
}

const ID_SAFE = /^[A-Za-z0-9_-]+$/

/** Saves the order to the panel. Throws if it could not be saved. */
export async function saveOrder(o: OrderInput): Promise<void> {
  if (!ID_SAFE.test(o.ref)) throw new Error('bad ref')
  const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: '2025-02-19',
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
  })
  const strip = (v: Record<string, string>) => Object.fromEntries(Object.entries(v).filter(([, x]) => x))
  await client.create(
    {
      // The dot keeps the order private. Never change this to a plain ID.
      _id: `orders.${o.ref}`,
      _type: 'order',
      ref: o.ref,
      status: 'awaiting_payment',
      placedAt: new Date().toISOString(),
      customer: strip(o.customer),
      items: o.quote.lines.map((l, i) => ({
        _key: `i${i}`,
        name: l.name,
        size: l.size || '',
        qty: l.qty,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
        ...(l.id && !l.id.startsWith('sample-') ? { product: { _type: 'reference', _ref: l.id.replace(/^drafts\./, ''), _weak: true } } : {}),
      })),
      subtotal: o.quote.subtotal,
      deliveryFee: o.quote.deliveryFee,
      total: o.quote.total,
      paymentMethod: o.paymentMethod,
      attribution: strip(o.attribution),
    },
    { visibility: 'sync' },
  )
}

/** Rings the owner's phone. Never throws: an alert failing must not lose the order. */
export async function alertOwner(o: OrderInput, saved: boolean): Promise<void> {
  const topic = process.env.NTFY_TOPIC
  if (!topic || !ID_SAFE.test(topic)) return
  const items = o.quote.lines.reduce((n, l) => n + l.qty, 0)
  const body = saved
    ? `${formatPKR(o.quote.total)} · ${items} ${items === 1 ? 'piece' : 'pieces'} · ${o.customer.city}. Awaiting payment. Open the panel to see the details.`
    : `${formatPKR(o.quote.total)} · ${o.customer.city}. The order could NOT be saved in the panel: the customer was asked to send it on WhatsApp. Check WhatsApp now.`
  try {
    await fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      // Header values must be plain ASCII.
      headers: {
        Title: saved ? `New order ${o.ref}` : `ORDER NOT SAVED ${o.ref}`,
        Priority: 'urgent',
        Tags: saved ? 'rotating_light,shopping_bags' : 'warning',
        Click: `${SITE_URL}/studio/structure/orders`,
      },
      body,
      signal: AbortSignal.timeout(5000),
    })
  } catch {
    /* the order is already saved; nothing else to do */
  }
}

/** Optional extra copy of the order (e.g. Google Sheet via Apps Script). Never throws. */
export async function sendWebhook(o: OrderInput): Promise<void> {
  const url = process.env.ORDERS_WEBHOOK_URL
  if (!url) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.ORDERS_WEBHOOK_SECRET || '',
        ref: o.ref,
        customer: o.customer,
        items: o.quote.lines.map((l) => ({ name: l.name, size: l.size || '', qty: l.qty, unitPrice: l.unitPrice, lineTotal: l.lineTotal })),
        subtotal: o.quote.subtotal,
        deliveryFee: o.quote.deliveryFee,
        total: o.quote.total,
        paymentMethod: o.paymentMethod,
        attribution: o.attribution,
      }),
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    /* optional */
  }
}
