import type { MetadataRoute } from 'next'
import { IS_SAMPLE, SITE_URL } from '@/lib/config'

export default function robots(): MetadataRoute.Robots {
  if (IS_SAMPLE) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/cart', '/checkout', '/order/', '/api/', '/studio'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
