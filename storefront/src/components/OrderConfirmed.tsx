'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { formatPKR } from '@/lib/format'
import { orderMessage, type OrderCustomer } from '@/lib/orderMessage'
import { track } from '@/lib/pixel'
import type { Quote } from '@/lib/types'
import { waLink } from '@/lib/whatsapp'
import { BankDetails } from './BankDetails'
import { useStore } from './StoreProvider'

type LastOrder = { ref: string; quote: Quote; customer: OrderCustomer }

export function OrderConfirmed() {
  const { whatsappNumber, bank, deliveryTime } = useStore()
  const [order, setOrder] = useState<LastOrder | null | undefined>(undefined)

  useEffect(() => {
    let found: LastOrder | null = null
    try {
      const raw = sessionStorage.getItem('vastre.lastOrder')
      found = raw ? (JSON.parse(raw) as LastOrder) : null
    } catch {
      found = null
    }
    setOrder(found)
    if (!found) return
    try {
      const flag = `vastre.purchased.${found.ref}`
      if (sessionStorage.getItem(flag)) return
      sessionStorage.setItem(flag, '1')
    } catch {
      /* fire once more rather than miss a sale */
    }
    track(
      'Purchase',
      {
        value: found.quote.total,
        currency: 'PKR',
        content_type: 'product',
        content_ids: found.quote.lines.map((l) => l.id),
        num_items: found.quote.lines.reduce((n, l) => n + l.qty, 0),
      },
      found.ref,
    )
  }, [])

  if (order === undefined) return <p className="muted" aria-busy="true">Loading&hellip;</p>

  if (!order) {
    return (
      <div className="empty">
        <p className="empty__title">No recent order on this device</p>
        <p className="muted">If you just placed one, it is saved. We will confirm it with you shortly.</p>
        <Link href="/shop" className="btn">Back to the shop</Link>
      </div>
    )
  }

  const wa = waLink(whatsappNumber, orderMessage({ ref: order.ref, quote: order.quote, customer: order.customer, payment: true }))

  return (
    <div className="confirmed">
      <p className="confirmed__ref">Order {order.ref}</p>
      <h1>Thank you, {order.customer.name.split(' ')[0]}. Your order is placed.</h1>
      <p className="lede">One step left: pay in advance so we can start making your piece. Your order is reserved for 48 hours; unpaid orders are cancelled after that.</p>

      <ol className="paysteps">
        <li>
          <h2>Transfer {formatPKR(order.quote.total)}</h2>
          <p className="muted">From any bank app, JazzCash or Easypaisa, to:</p>
          <BankDetails bank={bank} />
        </li>
        <li>
          <h2>Send us the screenshot</h2>
          <p className="muted">On WhatsApp, with your order number {order.ref}. The message is written for you; just attach the screenshot.</p>
          {wa ? (
            <a className="btn" href={wa} rel="noopener">Send payment screenshot on WhatsApp</a>
          ) : (
            <p className="muted">We will contact you on {order.customer.phone}.</p>
          )}
        </li>
        <li>
          <h2>We confirm and start making it</h2>
          <p className="muted">{deliveryTime || 'We confirm your payment on WhatsApp and share the tracking number when it ships.'}</p>
        </li>
      </ol>

      <section className="summary" aria-label="Order details">
        <h2>Order details</h2>
        <ul className="summary__items">
          {order.quote.lines.map((l) => (
            <li key={`${l.id}|${l.size ?? ''}`}>
              <span>{l.qty} &times; {l.name}{l.size ? ` (${l.size})` : ''}</span>
              <span>{formatPKR(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl>
          <div className="summary__row"><dt>Delivery</dt><dd>{order.quote.deliveryFee > 0 ? formatPKR(order.quote.deliveryFee) : 'Free'}</dd></div>
          <div className="summary__row summary__total"><dt>Total, paid in advance</dt><dd>{formatPKR(order.quote.total)}</dd></div>
        </dl>
        <p className="muted">Deliver to: {order.customer.address}, {order.customer.city}</p>
      </section>

      <Link href="/shop" className="ask-link">Keep shopping</Link>
    </div>
  )
}
