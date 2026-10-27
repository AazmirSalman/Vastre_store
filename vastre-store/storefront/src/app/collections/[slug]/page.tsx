import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CollectionChips, ProductGrid } from '@/components/Catalogue'
import { getCollectionBySlug, getCollections, getProducts } from '@/lib/data'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    return (await getCollections()).map((c) => ({ slug: c.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const c = await getCollectionBySlug(slug)
  if (!c) return {}
  return { title: c.title, description: c.description || undefined }
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const [collection, collections, products] = await Promise.all([getCollectionBySlug(slug), getCollections(), getProducts()])
  if (!collection) notFound()
  const items = products.filter((p) => p.collections?.some((c) => c.slug === slug))
  return (
    <div className="container section">
      <header className="page-head">
        <h1>{collection.title}</h1>
        {collection.description ? <p className="lede">{collection.description}</p> : null}
        <CollectionChips collections={collections} current={slug} />
      </header>
      {items.length > 0 ? <ProductGrid products={items} /> : <p className="muted">Nothing in this collection yet. Check back soon.</p>}
    </div>
  )
}
