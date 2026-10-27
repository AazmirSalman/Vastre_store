import Link from 'next/link'
import { discountPercent, formatPKR } from '@/lib/format'
import { isSoldOut } from '@/lib/product'
import type { Product } from '@/lib/types'
import { ProductImage } from './ProductImage'

const SIZES = '(min-width: 1000px) 24vw, (min-width: 700px) 32vw, 48vw'

export function ProductCard({ product: p }: { product: Product }) {
  const off = discountPercent(p.price, p.compareAtPrice)
  const out = isSoldOut(p)
  const second = p.images?.[1]
  return (
    <article className="card">
      <Link href={`/product/${p.slug}`} className="card__link">
        <div className="card__media">
          <ProductImage img={p.images?.[0]} alt={p.images?.[0]?.alt || p.name} tone={p.tone} sizes={SIZES} />
          {second ? <ProductImage img={second} alt="" sizes={SIZES} className="card__alt" /> : null}
          {out ? (
            <span className="tag tag--out">Sold out</span>
          ) : p.badge ? (
            <span className="tag">{p.badge}</span>
          ) : off ? (
            <span className="tag tag--sale">{off}% off</span>
          ) : null}
        </div>
        <h3 className="card__name">{p.name}</h3>
        {p.fabric ? <p className="card__meta">{p.fabric}</p> : null}
        <p className="card__price">
          <span>{formatPKR(p.price)}</span>
          {p.compareAtPrice && p.compareAtPrice > p.price ? <s>{formatPKR(p.compareAtPrice)}</s> : null}
        </p>
      </Link>
    </article>
  )
}
