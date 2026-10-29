import { IS_SAMPLE } from './config'
import { client } from './sanity'
import { SAMPLE_COLLECTIONS, SAMPLE_PRODUCTS, SAMPLE_SETTINGS } from './sample-data'
import type { Collection, Product, Settings } from './types'

const SETTINGS_QUERY = `*[_id == "siteSettings"][0]{
  storeName, tagline, announcement, heroHeadline, heroText,
  heroImage{ asset, hotspot, crop, alt }, heroButton,
  heroSlides[]{ title, text, buttonText, image{ asset, hotspot, crop, alt }, "collection": collection->{ title, "slug": slug.current } },
  "heroVideo": heroVideo.asset->url, "heroVideoWide": heroVideoWide.asset->url,
  lookbook[]{ image{ asset, hotspot, crop, alt }, "product": product->{ name, "slug": slug.current } },
  storyTitle, storyText, storyImage{ asset, hotspot, crop, alt },
  whatsappNumber, instagram, email,
  deliveryFee, localCity, localDeliveryFee, customSizeFee, modelSize, freeDeliveryOver, deliveryTime, returnSummary, codNote,
  sizeChart{ asset, hotspot, crop, alt },
  aboutText, deliveryPolicy, returnPolicy, privacyPolicy, metaPixelId
}`

const COLLECTION_FIELDS = `_id, title, "slug": slug.current, description, image{ asset, hotspot, crop, alt }`

const PRODUCT_FIELDS = `
  _id, name, "slug": slug.current, price, compareAtPrice,
  images[]{ asset, hotspot, crop, alt },
  fabric, description, details, sizes, soldOut, soldOutSizes, customSize, modelSize, badge, featured,
  "video": video.asset->url,
  "createdAt": _createdAt,
  "collections": collections[]->{ _id, title, "slug": slug.current }
`

const DEFAULT_SETTINGS: Settings = {
  storeName: 'Vastre',
  heroHeadline: 'Eastern wear, cut for the way you wear it',
  heroButton: 'Shop new arrivals',
  deliveryFee: 0,
}

/** GROQ returns null for empty fields; drop them so defaults apply. */
function stripNulls<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)) as Partial<T>
}

function cleanProduct(p: Product): Product {
  return {
    ...p,
    images: (p.images ?? []).filter((i) => i && i.asset),
    collections: (p.collections ?? []).filter(Boolean),
    sizes: p.sizes ?? [],
    soldOutSizes: p.soldOutSizes ?? [],
    details: p.details ?? [],
  }
}

export async function getSettings(): Promise<Settings> {
  if (IS_SAMPLE || !client) {
    return { ...SAMPLE_SETTINGS, whatsappNumber: process.env.WHATSAPP_NUMBER || '' }
  }
  const raw = await client.fetch<Partial<Settings> | null>(SETTINGS_QUERY)
  const merged = { ...DEFAULT_SETTINGS, ...stripNulls(raw ?? {}) } as Settings
  if (!merged.metaPixelId && process.env.NEXT_PUBLIC_META_PIXEL_ID) merged.metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  return merged
}

export async function getCollections(): Promise<Collection[]> {
  if (IS_SAMPLE || !client) return SAMPLE_COLLECTIONS
  return client.fetch<Collection[]>(
    `*[_type == "collection" && defined(slug.current)] | order(sortOrder asc, title asc){ ${COLLECTION_FIELDS} }`,
  )
}

/** Newest first. Products without a slug or price are never shown. */
export async function getProducts(): Promise<Product[]> {
  if (IS_SAMPLE || !client) {
    return [...SAMPLE_PRODUCTS].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
  }
  const rows = await client.fetch<Product[]>(
    `*[_type == "product" && defined(slug.current) && defined(price)] | order(_createdAt desc){ ${PRODUCT_FIELDS} }`,
  )
  return rows.map(cleanProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (IS_SAMPLE || !client) return SAMPLE_PRODUCTS.find((p) => p.slug === slug) ?? null
  const row = await client.fetch<Product | null>(
    `*[_type == "product" && slug.current == $slug && defined(price)][0]{ ${PRODUCT_FIELDS} }`,
    { slug },
  )
  return row ? cleanProduct(row) : null
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return []
  if (IS_SAMPLE || !client) return SAMPLE_PRODUCTS.filter((p) => ids.includes(p._id))
  const rows = await client.fetch<Product[]>(
    `*[_type == "product" && _id in $ids && defined(price)]{ ${PRODUCT_FIELDS} }`,
    { ids },
  )
  return rows.map(cleanProduct)
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const all = await getCollections()
  return all.find((c) => c.slug === slug) ?? null
}
