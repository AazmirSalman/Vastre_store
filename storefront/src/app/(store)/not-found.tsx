import Link from 'next/link'

/** Shown when a product, collection or page link is wrong. The shop layout already adds the header and footer. */
export default function NotFound() {
  return (
    <div className="wrap section">
      <div className="empty">
        <p className="empty__title">We could not find that page</p>
        <p className="muted">The link may be old, or the piece may no longer be on sale.</p>
        <Link href="/shop" className="btn">Browse the collection</Link>
      </div>
    </div>
  )
}
