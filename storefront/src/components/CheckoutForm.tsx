'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { readAttribution } from '@/lib/attribution'
import { formatPKR, normalizePhone } from '@/lib/format'
import { orderMessage } from '@/lib/orderMessage'
import { track } from '@/lib/pixel'
import { CUSTOM } from '@/lib/customSize'
import type { Quote } from '@/lib/types'
import { useQuote } from '@/lib/useQuote'
import { waLink } from '@/lib/whatsapp'
import { BankDetails } from './BankDetails'
import { useCart } from './CartProvider'
import { useStore } from './StoreProvider'

type Fields = 'name' | 'phone' | 'city' | 'address' | 'measurements'

export function CheckoutForm() {
  const router = useRouter()
  const { lines, ready, clear } = useCart()
  const { whatsappNumber, codNote, bank } = useStore()
  const [cityInput, setCityInput] = useState('')
  const [city, setCity] = useState('')
  // Re-price shortly after the customer stops typing the city, because the city sets the delivery charge.
  useEffect(() => {
    const t = setTimeout(() => setCity(cityInput.trim()), 400)
    return () => clearTimeout(t)
  }, [cityInput])
  const { quote, setQuote, error: quoteError } = useQuote(lines, ready, city)
  const hasCustom = lines.some((l) => l.size === CUSTOM)

  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({})
  const [formError, setFormError] = useState('')
  const [notConfigured, setNotConfigured] = useState(false)
  // The customer's details, kept so the WhatsApp fallback can carry them if saving the order fails.
  const [typed, setTyped] = useState<{ name: string; phone: string; city: string; address: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)
  const tracked = useRef(false)

  useEffect(() => {
    if (!quote || tracked.current || !quote.allOk) return
    tracked.current = true
    track('InitiateCheckout', {
      value: quote.subtotal,
      currency: 'PKR',
      num_items: quote.lines.reduce((n, l) => n + l.qty, 0),
      content_ids: quote.lines.map((l) => l.id),
      content_type: 'product',
    })
  }, [quote])

  useEffect(() => {
    if (formError) summaryRef.current?.focus()
  }, [formError])

  if (done) return <p role="status">Placing your order&hellip;</p>
  if (!ready) return <p className="muted" aria-busy="true">Loading&hellip;</p>

  if (lines.length === 0) {
    return (
      <div className="empty">
        <p className="empty__title">Your cart is empty</p>
        <Link href="/shop" className="btn">Browse the collection</Link>
      </div>
    )
  }
  if (quoteError && !quote) return <p role="alert">{quoteError}</p>
  if (!quote) return <p className="muted" aria-busy="true">Checking current prices&hellip;</p>

  if (!quote.allOk) {
    return (
      <div className="empty">
        <p role="alert">Some items in your cart need attention before you can order.</p>
        <Link href="/cart" className="btn">Review your cart</Link>
      </div>
    )
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy || !quote) return
    const fd = new FormData(e.currentTarget)
    const customer = {
      name: String(fd.get('name') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      city: String(fd.get('city') || '').trim(),
      address: String(fd.get('address') || '').trim(),
      notes: String(fd.get('notes') || '').trim(),
      measurements: String(fd.get('measurements') || '').trim(),
    }

    const next: Partial<Record<Fields, string>> = {}
    if (customer.name.length < 2) next.name = 'Enter your full name.'
    if (!normalizePhone(customer.phone)) next.phone = 'Enter a Pakistani mobile number, like 0300 1234567.'
    if (customer.city.length < 2) next.city = 'Enter your city.'
    if (customer.address.length < 8) next.address = 'Enter your full delivery address, with house number and area.'
    if (hasCustom && customer.measurements.length < 5) next.measurements = 'Add your measurements for the custom size.'
    setErrors(next)
    setFormError('')
    setNotConfigured(false)
    if (Object.keys(next).length > 0) {
      setFormError('Check the highlighted fields.')
      return
    }

    setTyped({ name: customer.name, phone: normalizePhone(customer.phone) || customer.phone, city: customer.city, address: customer.address })
    setBusy(true)
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lines,
          customer,
          attribution: readAttribution(),
          // Only promise a total when it was priced for the city typed in.
          expectedTotal: quote.cityKnown && city === customer.city ? quote.total : undefined,
          website: String(fd.get('website') || ''),
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ref?: string
        quote?: Quote | null
        error?: string
        fields?: Partial<Record<Fields, string>>
      }

      if (res.ok && data.ref && data.quote) {
        const phone = normalizePhone(customer.phone) || customer.phone
        sessionStorage.setItem(
          'vastre.lastOrder',
          JSON.stringify({ ref: data.ref, quote: data.quote, customer: { name: customer.name, phone, city: customer.city, address: customer.address } }),
        )
        setDone(true)
        clear()
        router.push('/order/confirmed')
        return
      }
      if (res.status === 422 && data.fields) {
        setErrors(data.fields)
        setFormError(data.error || 'Check the highlighted fields.')
      } else if (res.status === 409) {
        if (data.quote) setQuote(data.quote)
        setFormError(data.error || 'Your cart changed. Review it and try again.')
      } else if (res.status === 503 || (res.status === 502 && (data as { fallback?: boolean }).fallback)) {
        setNotConfigured(true)
      } else {
        setFormError(data.error || 'We could not place your order. Please try again, or order on WhatsApp.')
      }
    } catch {
      setFormError('We could not reach the shop. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  const fallback = waLink(whatsappNumber, orderMessage({ quote, customer: typed ?? undefined }))

  return (
    <div className="checkout">
      <form className="form" onSubmit={onSubmit} noValidate>
        <div ref={summaryRef} tabIndex={-1} className={formError ? 'error-summary' : 'visually-hidden'} role={formError ? 'alert' : undefined}>
          {formError}
        </div>

        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" type="text" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-err' : undefined} required />
          {errors.name ? <p id="name-err" className="field-error">{errors.name}</p> : null}
        </div>

        <div className="field">
          <label htmlFor="phone">Mobile number</label>
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-err' : 'phone-hint'} required />
          {errors.phone ? <p id="phone-err" className="field-error">{errors.phone}</p> : <p id="phone-hint" className="hint">We call or message this number to confirm your order.</p>}
        </div>

        <div className="field">
          <label htmlFor="city">City</label>
          <input id="city" name="city" type="text" autoComplete="address-level2" value={cityInput} onChange={(e) => setCityInput(e.target.value)} aria-invalid={!!errors.city} aria-describedby={errors.city ? 'city-err' : 'city-hint'} required />
          {errors.city ? <p id="city-err" className="field-error">{errors.city}</p> : <p id="city-hint" className="hint">{quote.deliveryNote}.</p>}
        </div>

        <div className="field">
          <label htmlFor="address">Delivery address</label>
          <textarea id="address" name="address" rows={3} autoComplete="street-address" aria-invalid={!!errors.address} aria-describedby={errors.address ? 'address-err' : 'address-hint'} required />
          {errors.address ? <p id="address-err" className="field-error">{errors.address}</p> : <p id="address-hint" className="hint">House number, street, area and a nearby landmark.</p>}
        </div>

        {hasCustom ? (
          <div className="field">
            <label htmlFor="measurements">Measurements for your custom size</label>
            <textarea id="measurements" name="measurements" rows={3} aria-invalid={!!errors.measurements} aria-describedby={errors.measurements ? 'measurements-err' : 'measurements-hint'} required />
            {errors.measurements ? <p id="measurements-err" className="field-error">{errors.measurements}</p> : <p id="measurements-hint" className="hint">In inches: chest, waist, hips, shirt length, sleeve length, trouser length. We will confirm them with you on WhatsApp.</p>}
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="notes">Notes for us <span className="muted">(optional)</span></label>
          <textarea id="notes" name="notes" rows={2} />
        </div>

        {/* Hidden from people; bots fill it in and are ignored. */}
        <div className="hp" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="payment">
          <h2>Payment</h2>
          <p><strong>Bank transfer, 100% in advance.</strong> {codNote || 'Every piece is made to order, so payment is taken in advance.'}</p>
          <p className="hint">Place your order first. It is reserved for you for 48 hours, and you will get your order number and these details again, with a button to send us the payment screenshot on WhatsApp.</p>
          {whatsappNumber ? (
            <p className="hint">
              Questions before you pay?{' '}
              <a href={waLink(whatsappNumber, 'Assalam o Alaikum! I have a question before placing my order.') ?? undefined} rel="noopener">
                Chat with us on WhatsApp
              </a>
            </p>
          ) : null}
          <BankDetails bank={bank} />
        </div>

        {notConfigured ? (
          <div className="notice" role="alert">
            <p>We could not save your order online just now. Your order is not lost: send it to us on WhatsApp and we will confirm it.</p>
            {fallback ? <a className="btn btn--block" href={fallback} rel="noopener">Send order on WhatsApp</a> : null}
          </div>
        ) : null}

        <button type="submit" className="btn btn--block" disabled={busy}>
          {busy ? 'Placing order…' : quote.cityKnown ? `Place order · ${formatPKR(quote.total)}` : 'Place order'}
        </button>
        {fallback && !notConfigured ? (
          <a className="ask-link" href={fallback} rel="noopener">Prefer WhatsApp? Send this order there instead</a>
        ) : null}
      </form>

      <aside className="summary" aria-label="Order summary">
        <h2>Your order</h2>
        <ul className="summary__items">
          {quote.lines.map((l) => (
            <li key={`${l.id}|${l.size ?? ''}`}>
              <span>{l.qty} &times; {l.name}{l.size ? ` (${l.size})` : ''}</span>
              <span>{formatPKR(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl>
          <div className="summary__row"><dt>Subtotal</dt><dd>{formatPKR(quote.subtotal)}</dd></div>
          <div className="summary__row"><dt>Delivery</dt><dd>{!quote.cityKnown ? 'Enter your city' : quote.deliveryFee > 0 ? formatPKR(quote.deliveryFee) : 'Free'}</dd></div>
          <div className="summary__row summary__total"><dt>Total</dt><dd>{quote.cityKnown ? formatPKR(quote.total) : `${formatPKR(quote.subtotal)} + delivery`}</dd></div>
        </dl>
        <Link href="/cart" className="ask-link">Edit cart</Link>
      </aside>
    </div>
  )
}
