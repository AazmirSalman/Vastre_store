import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { StoreChrome } from '@/components/StoreChrome'
import { IS_SAMPLE, SITE_URL } from '@/lib/config'
import { getSettings } from '@/lib/data'

export const revalidate = 60

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4A1634',
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  const title = s.tagline ? `${s.storeName} | ${s.tagline}` : s.storeName
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${s.storeName}` },
    description: s.heroText || `${s.storeName}${s.tagline ? ': ' + s.tagline : ''}. Cash on delivery.`,
    openGraph: { siteName: s.storeName, type: 'website', locale: 'en_PK' },
    // Never let the sample-data preview get indexed by search engines.
    robots: IS_SAMPLE ? { index: false, follow: false } : undefined,
  }
}

export default function StoreLayout({ children }: { children: ReactNode }) {
  return <StoreChrome>{children}</StoreChrome>
}
