'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useCart } from './CartProvider'

type Props = { storeName: string; collections: { title: string; slug: string }[]; instagram?: string; codNote?: string }

export function Header({ storeName, collections, instagram, codNote }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { count, ready, openDrawer } = useCart()
  const menuBtn = useRef<HTMLButtonElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    closeBtn.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        menuBtn.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const items = ready ? count : 0
  const on = (href: string) => (pathname === href ? 'page' : undefined)

  return (
    <header className="site-head">
      <div className="wrap bar">
        <div className="bar__left">
          <button ref={menuBtn} type="button" className="icon-btn menu-btn" aria-label="Open menu" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M3 8h18M3 16h18" />
            </svg>
          </button>
          <nav className="nav" aria-label="Main">
            <Link href="/shop" aria-current={on('/shop')}>Shop all</Link>
            {collections.slice(0, 4).map((c) => (
              <Link key={c.slug} href={`/collections/${c.slug}`} aria-current={on(`/collections/${c.slug}`)}>
                {c.title}
              </Link>
            ))}
          </nav>
        </div>
        <Link href="/" className="mark" aria-label={`${storeName}, home`}>
          <span className="logo" aria-hidden="true" />
        </Link>
        <div className="bar__right">
          <button type="button" className="icon-btn" aria-label={`Open cart, ${items} ${items === 1 ? 'item' : 'items'}`} onClick={openDrawer}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 8h14l-1 12H6L5 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span className="count" data-n={items}>{items}</span>
          </button>
        </div>
      </div>

      <div id="menu" className="menu" hidden={!open} role="dialog" aria-modal="true" aria-label="Menu">
        <div className="menu__top">
          <span className="mark" role="img" aria-label={storeName}><span className="logo" aria-hidden="true" /></span>
          <button
            ref={closeBtn}
            type="button"
            className="icon-btn"
            aria-label="Close menu"
            onClick={() => {
              setOpen(false)
              menuBtn.current?.focus()
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>
        <Link href="/shop" className="menu__link">Shop all</Link>
        {collections.map((c) => (
          <Link key={c.slug} href={`/collections/${c.slug}`} className="menu__link">
            {c.title}
          </Link>
        ))}
        <p className="menu__sub">
          {codNote || 'Cash on delivery across Pakistan.'}
          {instagram ? (
            <>
              <br />
              Instagram @{instagram.replace(/^@/, '')}
            </>
          ) : null}
        </p>
      </div>
    </header>
  )
}
