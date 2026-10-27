'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { formatPKR } from '@/lib/format'
import { useQuote } from '@/lib/useQuote'
import { lineKey, useCart } from './CartProvider'

/** The cart that slides in from the right. Prices are checked with the server, never trusted from the browser. */
export function CartDrawer() {
  const { lines, ready, setQty, remove, drawerOpen, closeDrawer } = useCart()
  const { quote, error } = useQuote(lines, ready && drawerOpen)
  const pathname = usePathname()
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocus = useRef<Element | null>(null)

  useEffect(() => closeDrawer(), [pathname, closeDrawer])

  useEffect(() => {
    if (!drawerOpen) return
    lastFocus.current = document.activeElement
    const t = setTimeout(() => closeRef.current?.focus(), 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      const el = lastFocus.current as HTMLElement | null
      el?.focus?.()
    }
  }, [drawerOpen, closeDrawer])

  const nudge =
    quote && quote.freeDeliveryOver !== null && quote.subtotal > 0 && quote.subtotal < quote.freeDeliveryOver
      ? quote.freeDeliveryOver - quote.subtotal
      : null

  return (
    <>
      <div className="scrim" hidden={!drawerOpen} onClick={closeDrawer} />
      <aside className={`drawer${drawerOpen ? ' on' : ''}`} role="dialog" aria-modal="true" aria-labelledby="drawer-title" aria-hidden={!drawerOpen}>
        <header>
          <h2 id="drawer-title">Your cart</h2>
          <button ref={closeRef} type="button" className="icon-btn" aria-label="Close cart" onClick={closeDrawer}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </header>
        <div className="drawer__lines">
          {lines.length === 0 ? (
            <div className="drawer__empty">
              <p>Your cart is empty.</p>
              <Link href="/shop" className="btn btn--ghost" onClick={closeDrawer}>
                Shop all pieces
              </Link>
            </div>
          ) : error && !quote ? (
            <p role="alert" className="drawer__empty">{error}</p>
          ) : !quote ? (
            <p className="muted drawer__empty" aria-busy="true">Checking current prices&hellip;</p>
          ) : (
            quote.lines.map((l, i) => {
              const src = lines[i]
              if (!src) return null
              const key = lineKey(src)
              return (
                <div key={key} className="dline">
                  <div className="dline__media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {l.image ? <img src={l.image} alt="" width={84} height={112} loading="lazy" /> : null}
                  </div>
                  <div>
                    <h3>{l.name}</h3>
                    <p className="dline__meta">
                      {l.size ? `Size ${l.size}, ` : ''}
                      {formatPKR(l.unitPrice)}
                    </p>
                    {l.problem ? <p className="field-error">{l.problem}</p> : null}
                    <div className="dline__ctrl">
                      <div className="qty" role="group" aria-label={`Quantity of ${l.name}`}>
                        <button type="button" className="qty__btn" aria-label={`Decrease quantity of ${l.name}`} onClick={() => setQty(key, src.qty - 1)} disabled={src.qty <= 1}>&minus;</button>
                        <output className="qty__val">{src.qty}</output>
                        <button type="button" className="qty__btn" aria-label={`Increase quantity of ${l.name}`} onClick={() => setQty(key, src.qty + 1)} disabled={src.qty >= 10}>+</button>
                      </div>
                      <button type="button" className="link-btn" onClick={() => remove(key)}>Remove</button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
        {quote && lines.length > 0 ? (
          <footer>
            <div className="tot"><span>Subtotal</span><span>{formatPKR(quote.subtotal)}</span></div>
            <div className="tot"><span>Delivery</span><span>{quote.deliveryFee > 0 ? formatPKR(quote.deliveryFee) : 'Free'}</span></div>
            <div className="tot tot--big"><span>Total, pay on delivery</span><span>{formatPKR(quote.total)}</span></div>
            {nudge !== null ? <p className="nudge">Add {formatPKR(nudge)} more for free delivery.</p> : null}
            {quote.allOk ? (
              <Link href="/checkout" className="btn btn--block">Checkout</Link>
            ) : (
              <button type="button" className="btn btn--block" disabled>Checkout</button>
            )}
          </footer>
        ) : null}
      </aside>
    </>
  )
}
