import Link from 'next/link'
import type { Collection, Product } from '@/lib/types'
import { ProductCard } from './ProductCard'

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid">
      {products.map((p) => (
        <li key={p._id}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  )
}

export function CollectionChips({ collections, current }: { collections: Collection[]; current?: string }) {
  if (collections.length === 0) return null
  return (
    <nav className="chips" aria-label="Filter by collection">
      <Link href="/shop" className="chip" aria-current={!current ? 'page' : undefined}>
        All
      </Link>
      {collections.map((c) => (
        <Link key={c.slug} href={`/collections/${c.slug}`} className="chip" aria-current={current === c.slug ? 'page' : undefined}>
          {c.title}
        </Link>
      ))}
    </nav>
  )
}
