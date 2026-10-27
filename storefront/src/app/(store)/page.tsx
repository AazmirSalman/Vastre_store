import Link from 'next/link'
import type { CSSProperties } from 'react'
import { ProductGrid } from '@/components/Catalogue'
import { ProductImage } from '@/components/ProductImage'
import { getCollections, getProducts, getSettings } from '@/lib/data'
import { waLink } from '@/lib/whatsapp'

export const revalidate = 60

export default async function HomePage() {
  const [settings, collections, products] = await Promise.all([getSettings(), getCollections(), getProducts()])
  const featured = products.filter((p) => p.featured)
  const useFeatured = featured.length >= 4
  const pool = useFeatured ? featured : products
  // Show full rows of 4 on desktop (and pairs on phones). Fewer than 4 products: show them all.
  const rows = Math.floor(Math.min(pool.length, 8) / 4)
  const picks = rows >= 1 ? pool.slice(0, rows * 4) : pool
  const wa = waLink(settings.whatsappNumber, 'Assalam o Alaikum! I would like to place an order.')
  const ig = settings.instagram?.replace(/^@/, '')

  const trust = [
    { title: 'Pay on delivery', text: settings.codNote },
    { title: 'Delivery', text: settings.deliveryTime },
    { title: 'Exchanges', text: settings.returnSummary },
  ].filter((t) => t.text)

  return (
    <>
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero__copy">
          <h1 id="hero-title">{settings.heroHeadline}</h1>
          {settings.heroText ? <p className="lede">{settings.heroText}</p> : null}
          <div className="hero__actions">
            <Link href="/shop" className="btn">
              {settings.heroButton}
            </Link>
            {wa ? (
              <a href={wa} className="btn btn--ghost" rel="noopener">
                Order on WhatsApp
              </a>
            ) : null}
          </div>
        </div>
        <div className="hero__art">
          <div className="arch">
            <ProductImage
              img={settings.heroImage}
              alt={settings.heroImage?.alt || ''}
              tone="plum"
              priority
              sizes="(min-width: 900px) 40vw, 90vw"
            />
          </div>
        </div>
      </section>

      {collections.length > 0 ? (
        <section className="section container" aria-labelledby="collections-title">
          <div className="section__head">
            <h2 id="collections-title">Shop by collection</h2>
          </div>
          <ul className="tiles" style={{ '--cols': Math.min(collections.length, 5) } as CSSProperties}>
            {collections.map((c) => (
              <li key={c.slug}>
                <Link href={`/collections/${c.slug}`} className="tile">
                  <div className="tile__arch">
                    <ProductImage img={c.image} alt="" tone={c.tone ?? 'blush'} sizes="(min-width: 900px) 22vw, 58vw" />
                  </div>
                  <span className="tile__name">{c.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {picks.length > 0 ? (
        <section className="section container" aria-labelledby="picks-title">
          <div className="section__head">
            <h2 id="picks-title">{useFeatured ? 'Our picks' : 'New arrivals'}</h2>
            <Link href="/shop" className="more">
              View all
            </Link>
          </div>
          <ProductGrid products={picks} />
        </section>
      ) : null}

      {trust.length > 0 ? (
        <section className="trust" aria-label="Ordering with us">
          <ul className="trust__list container">
            {trust.map((t) => (
              <li key={t.title}>
                <h3 className="trust__title">{t.title}</h3>
                <p>{t.text}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="section container" aria-labelledby="how-title">
        <div className="section__head">
          <h2 id="how-title">How ordering works</h2>
        </div>
        <ol className="steps">
          <li>
            <h3 className="step__title">Choose your piece</h3>
            <p>Pick a piece and your size, then add it to your cart.</p>
          </li>
          <li>
            <h3 className="step__title">Place your order</h3>
            <p>Enter your address. You pay in cash when your parcel arrives.</p>
          </li>
          <li>
            <h3 className="step__title">We confirm and dispatch</h3>
            <p>We confirm your order on WhatsApp and send it to your door.</p>
          </li>
        </ol>
      </section>

      {ig ? (
        <section className="insta" aria-labelledby="insta-title">
          <div className="container insta__inner">
            <h2 id="insta-title">See what is new on Instagram</h2>
            <a className="btn btn--light" href={`https://www.instagram.com/${ig}`} rel="noopener">
              Follow @{ig}
            </a>
          </div>
        </section>
      ) : null}
    </>
  )
}
