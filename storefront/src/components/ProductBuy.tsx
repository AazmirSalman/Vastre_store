'use client'

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

  function handleAdd() {
    if (needsSize && !size) {
      setError('Choose a size to continue.')
      const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      sizeRef.current?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' })
      return
    }
    add({ id, size: size || undefined, qty })
    track('AddToCart', { content_ids: [id], content_name: name, content_type: 'product', value: price * qty, currency: 'PKR' })
    setError('')
    setAdded(true)
    openDrawer()
  }

  const ask = waLink(whatsappNumber, `Assalam o Alaikum! I have a question about ${name}: ${SITE_URL}/product/${slug}`)

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
          <legend>Size</legend>
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

      <button type="button" ref={addRef} className="btn btn--block" onClick={handleAdd}>
        Add to cart &middot; {formatPKR(price * qty)}
      </button>

      <div role="status" className="visually-hidden">
        {added ? 'Added to your cart.' : ''}
      </div>

      {ask ? (
        <a className="ask-link" href={ask} rel="noopener">
          Questions about size or fabric? Ask on WhatsApp
        </a>
      ) : null}

      <div className="buybar" hidden={!barVisible}>
        <div className="buybar__price">
          <span className="buybar__name">{name}</span>
          <strong>{formatPKR(price * qty)}</strong>
        </div>
        <button type="button" className="btn" onClick={handleAdd}>
          Add to cart
        </button>
      </div>
    </div>
  )
}
