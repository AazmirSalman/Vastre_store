import Link from 'next/link'
import { waLink } from '@/lib/whatsapp'
import type { Collection, Settings } from '@/lib/types'

export function Footer({ settings, collections }: { settings: Settings; collections: Collection[] }) {
  const wa = waLink(settings.whatsappNumber, 'Assalam o Alaikum! I have a question.')
  const ig = settings.instagram?.replace(/^@/, '')
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <p className="footer__name">{settings.storeName}</p>
          {settings.tagline ? <p>{settings.tagline}</p> : null}
        </div>
        <nav className="footer__col" aria-label="Shop">
          <h2>Shop</h2>
          <ul>
            <li><Link href="/shop">All pieces</Link></li>
            {collections.map((c) => (
              <li key={c.slug}><Link href={`/collections/${c.slug}`}>{c.title}</Link></li>
            ))}
          </ul>
        </nav>
        <nav className="footer__col" aria-label="Help">
          <h2>Help</h2>
          <ul>
            {settings.deliveryPolicy ? <li><Link href="/policies/delivery">Delivery</Link></li> : null}
            {settings.returnPolicy ? <li><Link href="/policies/returns">Returns and exchanges</Link></li> : null}
            {settings.aboutText ? <li><Link href="/policies/about">About us</Link></li> : null}
            <li><Link href="/policies/privacy">Privacy</Link></li>
          </ul>
        </nav>
        <div className="footer__col">
          <h2>Contact</h2>
          <ul>
            {wa ? <li><a href={wa} rel="noopener">WhatsApp</a></li> : null}
            {ig ? <li><a href={`https://www.instagram.com/${ig}`} rel="noopener">Instagram @{ig}</a></li> : null}
            {settings.email ? <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li> : null}
          </ul>
        </div>
      </div>
      <div className="container footer__bottom">
        <p>&copy; {new Date().getFullYear()} {settings.storeName}</p>
      </div>
    </footer>
  )
}
