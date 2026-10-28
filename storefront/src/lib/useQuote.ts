'use client'

import { useEffect, useState } from 'react'
import type { CartLine, Quote } from './types'

/** Fetches current prices for the cart from the server. */
export function useQuote(lines: CartLine[], enabled: boolean, city?: string) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const signature = JSON.stringify([lines, city || ''])

  useEffect(() => {
    if (!enabled || lines.length === 0) {
      setQuote(null)
      setError(null)
      setLoading(false)
      return
    }
    const ctrl = new AbortController()
    setLoading(true)
    fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: lines, city }),
      signal: ctrl.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error('quote failed')
        return r.json() as Promise<Quote>
      })
      .then((q) => {
        setQuote(q)
        setError(null)
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError('Could not load current prices. Check your connection and try again.')
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false)
      })
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, enabled])

  return { quote, setQuote, error, loading }
}
