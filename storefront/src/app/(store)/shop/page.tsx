import type { Metadata } from 'next'
import { CollectionChips, ProductGrid } from '@/components/Catalogue'
import { getCollections, getProducts } from '@/lib/data'

export const revalidate = 60
export const metadata: Metadata = { title: 'Shop all' }

export default async function ShopPage() {
  const [collections, products] = await Promise.all([getCollections(), getProducts()])
  return (
    <div className="wrap section">
      <header className="page-head">
        <h1>All pieces</h1>
        <p className="lede">Every piece in the store, newest first.</p>
        <CollectionChips collections={collections} />
      </header>
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <p className="muted">New pieces are on their way. Check back soon.</p>
      )}
    </div>
  )
}
