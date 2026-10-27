import type { ReactNode } from 'react'
import '@fontsource-variable/bodoni-moda/opsz.css'
import '@fontsource-variable/jost/wght.css'
import '../app/globals.css'
import { CartProvider } from '@/components/CartProvider'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { MetaPixel } from '@/components/MetaPixel'
import { StoreProvider } from '@/components/StoreProvider'
import { Tracking } from '@/components/Tracking'
import { IS_SAMPLE } from '@/lib/config'
import { getCollections, getSettings } from '@/lib/data'

/** Everything a shopper sees around a page: banner, header, footer, cart and tracking. The editing panel (/studio) does not use this. */
export async function StoreChrome({ children }: { children: ReactNode }) {
  const [settings, collections] = await Promise.all([getSettings(), getCollections()])
  return (
    <>
      <MetaPixel id={settings.metaPixelId} />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <StoreProvider
        value={{
          storeName: settings.storeName,
          whatsappNumber: settings.whatsappNumber || '',
          instagram: settings.instagram,
          codNote: settings.codNote,
          deliveryTime: settings.deliveryTime,
          returnSummary: settings.returnSummary,
        }}
      >
        <CartProvider>
          <Tracking />
          {IS_SAMPLE ? (
            <p className="demo-banner" role="note">
              Preview with sample products. Connect the catalogue to show the real ones.
            </p>
          ) : null}
          {settings.announcement ? <p className="announce">{settings.announcement}</p> : null}
          <Header storeName={settings.storeName} collections={collections.map((c) => ({ title: c.title, slug: c.slug }))} />
          <main id="main">{children}</main>
          <Footer settings={settings} collections={collections} />
        </CartProvider>
      </StoreProvider>
    </>
  )
}
