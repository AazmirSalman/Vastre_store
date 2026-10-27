'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCart } from './CartProvider'

type Props = { storeName: string; collections: { title: string; slug: string }[] }

export function Header({ storeName, collections }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { count, ready } = useCart()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const items = ready ? count : 0

  return (
    <header className="site-header">
      <div className="site-header__bar container">
        <div className="site-header__left">
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
          <nav id="site-nav" className="nav" data-open={open} aria-label="Main">
            <Link href="/shop">Shop all</Link>
            {collections.slice(0, 5).map((c) => (
              <Link key={c.slug} href={`/collections/${c.slug}`}>
                {c.title}
              </Link>
            ))}
          </nav>
        </div>
        <Link href="/" className="brand" aria-label={`${storeName} home`}>
          {storeName}
        </Link>
        <Link href="/cart" className="cart-link" aria-label={`Cart, ${items} ${items === 1 ? 'item' : 'items'}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 8h14l-1 12H6L5 8z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          <span className="cart-link__label">Cart</span>
          {items > 0 ? <span className="cart-link__count">{items}</span> : null}
        </Link>
      </div>
    </header>
  )
}
