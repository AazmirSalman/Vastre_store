import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/config'
import { getCollections, getProducts } from '@/lib/data'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now },
    { url: `${SITE_URL}/shop`, lastModified: now },
    { url: `${SITE_URL}/policies/privacy`, lastModified: now },
  ]
  try {
    const [collections, products] = await Promise.all([getCollections(), getProducts()])
    for (const c of collections) entries.push({ url: `${SITE_URL}/collections/${c.slug}`, lastModified: now })
    for (const p of products) entries.push({ url: `${SITE_URL}/product/${p.slug}`, lastModified: p.createdAt ? new Date(p.createdAt) : now })
  } catch {
    /* serve the static entries if the catalogue is unreachable */
  }
  return entries
}
