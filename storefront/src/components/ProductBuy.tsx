'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { SITE_URL } from '@/lib/config'
import { formatPKR } from '@/lib/format'
import { track } from '@/lib/pixel'
import { waLink } from '@/lib/whatsapp'
import { CUSTOM } from '@/lib/customSize'
import { useCart } from './CartProvider'
import { useStore } from './StoreProvider'

type Props = {
  id: string
  slug: string
  name: string
  price: number
  sizes: string[]
  soldOutSizes: string[]
  soldOut: boolean
  /** Extra charge for a made-to-measure size; 0 means not offered. */
  customFee?: number
}

export function ProductBuy({ id, slug, name, price: basePrice, sizes, soldOutSizes, soldOut, customFee = 0 }: Props) {
  const { add, openDrawer } = useCart()
  const router = useRouter()
  const { whatsappNumber } = useStore()
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')
  const [barVisible, setBarVisible] = useState(false)
  const addRef = useRef<HTMLButtonElement>(null)
  const sizeRef = useRef<HTMLFieldSetElement>(null)
  const needsSize = sizes.length > 0 || customFee > 0
  const price = size === CUSTOM ? basePrice + customFee : basePrice

  // Show a sticky "Add to cart" bar on phones once the main button scrolls out of view.
  useEffect(() => {
    const el = addRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setBarVisible(!entry.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  /** Adds the piece to the cart. Returns false (and points at the size picker) when a size is missing. */
  function addToCart(): boolean {
    if (needsSize && !size) {
      setError('Choose a size to continue.')
      const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      sizeRef.current?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' })
      return false
    }
    add({ id, size: size || undefined, qty })
    track('AddToCart', { content_ids: [id], content_name: name, content_type: 'product', value: price * qty, currency: 'PKR' })
    setError('')
    setAdded(true)
    return true
  }

  function handleAdd() {
    if (addToCart()) openDrawer()
  }

  /** Skips the cart: adds the piece and goes straight to checkout. */
  function handleBuyNow() {
    if (addToCart()) router.push('/checkout')
  }

  const sizeText = size === CUSTOM ? ' (custom size)' : size ? ` in size ${size}` : ''
  const ask = waLink(whatsappNumber, `Assalam o Alaikum! I'm interested in ${name}${sizeText}. ${SITE_URL}/product/${slug}`)

  if (soldOut) {
    return (
      <div className="buy">
        <p className="notice">This piece is sold out.</p>
        {ask ? (
          <a className="btn btn--ghost btn--block" href={ask} rel="noopener">
            Ask when it is back
          </a>
        ) : null}
      </div>
    )
  }

  return (
    <div className="buy">
      {needsSize ? (
        <fieldset className="field-set" ref={sizeRef} aria-describedby={error ? 'size-error' : undefined}>
          <legend className="size-head">
            <span>Size</span>
            <button
              type="button"
              className="size-guide"
              onClick={() => {
                const d = document.getElementById('size-chart') as HTMLDetailsElement | null
                if (!d) return
                d.open = true
                d.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
              }}
            >
              Size guide
            </button>
          </legend>
          <div className="sizes">
            {sizes.map((s) => {
              const out = soldOutSizes.includes(s)
              return (
                <label key={s} className={`size${out ? ' size--out' : ''}`}>
                  <input
                    type="radio"
                    name="size"
                    value={s}
                    checked={size === s}
                    disabled={out}
                    onChange={() => {
                      setSize(s)
                      setError('')
                      setAdded(false)
                    }}
                  />
                  <span>{s}</span>
                  {out ? <span className="visually-hidden"> (sold out)</span> : null}
                </label>
              )
            })}
            {customFee > 0 ? (
              <label className="size">
                <input
                  type="radio"
                  name="size"
                  value={CUSTOM}
                  checked={size === CUSTOM}
                  onChange={() => {
                    setSize(CUSTOM)
                    setError('')
                    setAdded(false)
                  }}
                />
                <span>Custom</span>
              </label>
            ) : null}
          </div>
          {size === CUSTOM ? (
            <p className="hint">Made to your measurements, {formatPKR(customFee)} extra. You add your measurements at checkout.</p>
          ) : null}
          {error ? (
            <p id="size-error" className="field-error" role="alert">
              {error}
            </p>
          ) : null}
        </fieldset>
      ) : null}

      <div className="qty-row">
        <span id="qty-label" className="label">Quantity</span>
        <div className="qty" role="group" aria-labelledby="qty-label">
          <button type="button" className="qty__btn" aria-label="Decrease quantity" onClick={() => { setQty((q) => Math.max(1, q - 1)); setAdded(false) }} disabled={qty <= 1}>
            &minus;
          </button>
          <output className="qty__val" aria-live="polite">{qty}</output>
          <button type="button" className="qty__btn" aria-label="Increase quantity" onClick={() => { setQty((q) => Math.min(10, q + 1)); setAdded(false) }} disabled={qty >= 10}>
            +
          </button>
        </div>
      </div>

      <div className="buy__actions">
        <button type="button" ref={addRef} className="btn btn--ghost btn--block" onClick={handleAdd}>
          Add to cart &middot; {formatPKR(price * qty)}
        </button>
        <button type="button" className="btn btn--block" onClick={handleBuyNow}>
          Buy it now
        </button>
      </div>

      <div role="status" className="visually-hidden">
        {added ? 'Added to your cart.' : ''}
      </div>

      {ask ? (
        <a className="btn btn--wa btn--block" href={ask} rel="noopener">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.6-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>
          Ask about this piece on WhatsApp
        </a>
      ) : null}

      <div className="buybar" hidden={!barVisible}>
        <div className="buybar__price">
          <span className="buybar__name">{name}</span>
          <strong>{formatPKR(price * qty)}</strong>
        </div>
        <button type="button" className="btn" onClick={handleBuyNow}>
          Buy it now
        </button>
      </div>
    </div>
  )
}
