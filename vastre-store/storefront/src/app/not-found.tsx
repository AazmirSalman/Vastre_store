import Link from 'next/link'
import { StoreChrome } from '@/components/StoreChrome'

/** Shown for any address that does not exist, with the shop's header and footer around it. */
export default function NotFound() {
  return (
    <StoreChrome>
      <div className="container section">
        <div className="empty">
          <p className="empty__title">We could not find that page</p>
          <p className="muted">The link may be old, or the piece may no longer be on sale.</p>
          <Link href="/shop" className="btn">Browse the collection</Link>
        </div>
      </div>
    </StoreChrome>
  )
}
