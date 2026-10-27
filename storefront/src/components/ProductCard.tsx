import Link from 'next/link'
import { discountPercent, formatPKR } from '@/lib/format'
import { isSoldOut } from '@/lib/product'
import type { Product } from '@/lib/types'
import { ProductImage } from './ProductImage'

const SIZES = '(min-width: 1100px) 24vw, (min-width: 720px) 32vw, 48vw'

export function ProductCard({ product: p }: { product: Product }) {
  const off = discountPercent(p.price, p.compareAtPrice)
  const out = isSoldOut(p)
  const second = p.images?.[1]
  const onSale = p.compareAtPrice && p.compareAtPrice > p.price
  return (
    <Link href={`/product/${p.slug}`} className="card">
      <div className="ph">
        {out ? (
          <span className="badge badge--out">Sold out</span>
        ) : p.badge ? (
          <span className="badge">{p.badge}</span>
        ) : off ? (
          <span className="badge">{off}% off</span>
        ) : null}
        <ProductImage img={p.images?.[0]} alt={p.images?.[0]?.alt || p.name} tone={p.tone} sizes={SIZES} />
        {second ? <ProductImage img={second} alt="" sizes={SIZES} className="ph__alt" /> : null}
      </div>
      <h3>{p.name}</h3>
      {p.fabric ? <p className="fab">{p.fabric}</p> : null}
      <p className="price">
        {onSale ? (
          <>
            <span className="now">{formatPKR(p.price)}</span>
            <s>{formatPKR(p.compareAtPrice!)}</s>
          </>
        ) : (
          formatPKR(p.price)
        )}
      </p>
    </Link>
  )
}
