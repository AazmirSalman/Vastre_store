'use client'

import Link from 'next/link'
import { formatPKR } from '@/lib/format'
import { useQuote } from '@/lib/useQuote'
import { Art } from './Art'
import { lineKey, useCart } from './CartProvider'

export function CartView() {
  const { lines, ready, setQty, remove } = useCart()
  const { quote, error, loading } = useQuote(lines, ready)

  if (!ready) return <p className="muted" aria-busy="true">Loading your cart&hellip;</p>

  if (lines.length === 0) {
    return (
      <div className="empty">
        <p className="empty__title">Your cart is empty</p>
        <p className="muted">Pick a piece you like and it will wait for you here.</p>
        <Link href="/shop" className="btn">Browse the collection</Link>
      </div>
    )
  }

  if (error && !quote) {
    return (
      <div className="empty">
        <p role="alert">{error}</p>
      </div>
    )
  }

  if (!quote) return <p className="muted" aria-busy="true">Checking current prices&hellip;</p>

  const nudge =
    quote.freeDeliveryOver !== null && quote.subtotal > 0 && quote.subtotal < quote.freeDeliveryOver
      ? quote.freeDeliveryOver - quote.subtotal
      : null

  return (
    <div className="cart" aria-busy={loading}>
      <ul className="cart__list">
        {quote.lines.map((l, i) => {
          const src = lines[i]
          if (!src) return null
          const key = lineKey(src)
          return (
            <li key={key} className="line">
              <div className="line__media">
                {l.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.image} alt="" width={80} height={100} loading="lazy" />
                ) : (
                  <Art tone="blush" />
                )}
              </div>
              <div className="line__body">
                {l.slug ? (
                  <Link href={`/product/${l.slug}`} className="line__name">{l.name}</Link>
                ) : (
                  <span className="line__name">{l.name}</span>
                )}
                {l.size ? <p className="line__meta">Size {l.size}</p> : null}
                <p className="line__meta">{formatPKR(l.unitPrice)} each</p>
                {l.problem ? <p className="line__problem" role="alert">{l.problem}</p> : null}
                <div className="line__actions">
                  <div className="qty" role="group" aria-label={`Quantity for ${l.name}`}>
                    <button type="button" className="qty__btn" aria-label={`Decrease quantity of ${l.name}`} onClick={() => setQty(key, src.qty - 1)} disabled={src.qty <= 1}>&minus;</button>
                    <output className="qty__val">{src.qty}</output>
                    <button type="button" className="qty__btn" aria-label={`Increase quantity of ${l.name}`} onClick={() => setQty(key, src.qty + 1)} disabled={src.qty >= 10}>+</button>
                  </div>
                  <button type="button" className="link-btn" onClick={() => remove(key)}>Remove</button>
                </div>
              </div>
              <p className="line__total">{l.ok ? formatPKR(l.lineTotal) : ''}</p>
            </li>
          )
        })}
      </ul>

      <aside className="summary" aria-label="Order summary">
        <h2>Summary</h2>
        <dl>
          <div className="summary__row"><dt>Subtotal</dt><dd>{formatPKR(quote.subtotal)}</dd></div>
          <div className="summary__row"><dt>Delivery</dt><dd>{quote.deliveryFee > 0 ? formatPKR(quote.deliveryFee) : 'Free'}</dd></div>
          <div className="summary__row summary__total"><dt>Total, pay on delivery</dt><dd>{formatPKR(quote.total)}</dd></div>
        </dl>
        {nudge !== null ? <p className="nudge">Add {formatPKR(nudge)} more for free delivery.</p> : null}
        {quote.allOk ? (
          <Link href="/checkout" className="btn btn--block">
            Checkout
          </Link>
        ) : (
          <>
            <button type="button" className="btn btn--block" disabled>Checkout</button>
            <p className="field-error">Fix the items marked above to continue.</p>
          </>
        )}
        <Link href="/shop" className="ask-link">Keep shopping</Link>
      </aside>
    </div>
  )
}
