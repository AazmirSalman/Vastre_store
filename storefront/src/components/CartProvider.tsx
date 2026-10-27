'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartLine } from '@/lib/types'

const KEY = 'vastre.cart.v1'

export const lineKey = (l: { id: string; size?: string }) => `${l.id}|${l.size ?? ''}`

type CartContext = {
  lines: CartLine[]
  ready: boolean
  count: number
  add: (line: CartLine) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
  /** The slide-out cart. */
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const Ctx = createContext<CartContext | null>(null)

function load(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
    if (!Array.isArray(raw)) return []
    return raw
      .filter((l) => l && typeof l.id === 'string' && Number.isFinite(l.qty) && l.qty > 0)
      .map((l) => ({ id: l.id as string, size: typeof l.size === 'string' && l.size ? l.size : undefined, qty: Math.min(10, Math.floor(l.qty)) }))
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [ready, setReady] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setLines(load())
    setReady(true)
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setLines(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(KEY, JSON.stringify(lines))
    } catch {
      /* private mode: the cart still works until the tab closes */
    }
  }, [lines, ready])

  const add = useCallback((line: CartLine) => {
    setLines((prev) => {
      const k = lineKey(line)
      const existing = prev.find((l) => lineKey(l) === k)
      if (existing) return prev.map((l) => (lineKey(l) === k ? { ...l, qty: Math.min(10, l.qty + line.qty) } : l))
      return [...prev, { ...line, qty: Math.min(10, line.qty) }]
    })
  }, [])

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      prev.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(10, Math.max(1, qty)) } : l)),
    )
  }, [])

  const remove = useCallback((key: string) => setLines((prev) => prev.filter((l) => lineKey(l) !== key)), [])
  const clear = useCallback(() => setLines([]), [])
  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const value = useMemo<CartContext>(
    () => ({ lines, ready, count: lines.reduce((n, l) => n + l.qty, 0), add, setQty, remove, clear, drawerOpen, openDrawer, closeDrawer }),
    [lines, ready, add, setQty, remove, clear, drawerOpen, openDrawer, closeDrawer],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCart(): CartContext {
  const v = useContext(Ctx)
  if (!v) throw new Error('useCart must be used inside CartProvider')
  return v
}
