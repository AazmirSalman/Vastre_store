import Link from 'next/link'
import type { CSSProperties } from 'react'
import { ProductGrid } from '@/components/Catalogue'
import { HeroSlider, type Slide } from '@/components/HeroSlider'
import { ProductImage } from '@/components/ProductImage'
import { getCollections, getProducts, getSettings } from '@/lib/data'
import { focus, focusPhone, imageUrl, wideUrl } from '@/lib/sanity'
import type { Img } from '@/lib/types'

export const revalidate = 60

const WIDE = [640, 960, 1280, 1600, 2000]
const wideSet = (img: Img) => WIDE.map((w) => `${wideUrl(img, w)} ${w}w`).join(', ')

export default async function HomePage() {
  const [settings, collections, products] = await Promise.all([getSettings(), getCollections(), getProducts()])

  // Slideshow from the panel. Without slides, fall back to the single headline and photo.
  const fromPanel: Slide[] = (settings.heroSlides ?? [])
    .filter((s) => s?.image?.asset)
    .map((s) => ({
      src: wideUrl(s.image!, 1600),
      srcSet: wideSet(s.image!),
      pos: focus(s.image),
      posM: focusPhone(s.image),
      title: s.title || settings.storeName,
      text: s.text,
      cta: s.buttonText || 'Shop now',
      href: s.collection?.slug ? `/collections/${s.collection.slug}` : '/shop',
    }))
  const slides: Slide[] = fromPanel.length
    ? fromPanel
    : [
        {
          src: settings.heroImage ? wideUrl(settings.heroImage, 1600) : undefined,
          srcSet: settings.heroImage ? wideSet(settings.heroImage) : undefined,
          pos: focus(settings.heroImage),
          posM: focusPhone(settings.heroImage),
          title: settings.heroHeadline || settings.storeName,
          text: settings.heroText,
          cta: settings.heroButton || 'Shop new arrivals',
          href: '/shop',
        },
      ]

  const featured = products.filter((p) => p.featured)
  const pool = featured.length >= 4 ? featured : products
  // One full row: 4 across on desktop, 2 by 2 on phones.
  const picks = pool.slice(0, 4)

  const story = settings.storyImage ?? products.find((p) => (p.images?.length ?? 0) > 2)?.images?.[2]
  const looks = (settings.lookbook ?? []).filter((l) => l?.image?.asset && l.product?.slug).slice(0, 12)
  const ig = settings.instagram?.replace(/^@/, '')

  const facts = [
    { title: 'Pay on delivery', text: settings.codNote },
    { title: 'Delivery', text: settings.deliveryTime },
    { title: 'Exchanges', text: settings.returnSummary },
  ].filter((t) => t.text)

  return (
    <>
      <HeroSlider slides={slides} video={{ phone: settings.heroVideo, wide: settings.heroVideoWide }} />

      {collections.length > 0 ? (
        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <h2>Shop by edit</h2>
            </div>
            <div className="tiles" style={{ '--n': Math.min(collections.length, 4) } as CSSProperties}>
              {collections.map((c) => (
                <Link key={c.slug} href={`/collections/${c.slug}`} className="tile">
                  <div className="tile__ph">
                    <ProductImage img={c.image} alt="" tone={c.tone} sizes="(min-width: 900px) 30vw, 72vw" />
                  </div>
                  <h3>{c.title}</h3>
                  {c.description ? <p>{c.description}</p> : null}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {picks.length > 0 ? (
        <section className="section section--tint">
          <div className="wrap">
            <div className="sec-head">
              <h2>{featured.length >= 4 ? 'Our picks' : 'New arrivals'}</h2>
              <Link href="/shop" className="link">
                View all
              </Link>
            </div>
            <ProductGrid products={picks} />
          </div>
        </section>
      ) : null}

      <section className="split">
        <div className="split__pic">
          {story ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl(story, 1000, 1250)} alt="" loading="lazy" style={{ objectPosition: focus(story) }} />
          ) : null}
        </div>
        <div className="split__txt">
          <h2>{settings.storyTitle || 'Eastern wear, cut for the way you wear it'}</h2>
          <p>
            {settings.storyText ||
              'Every piece is photographed on a real shoot and sent out carefully packed. Order online, we confirm on WhatsApp, and you pay when it arrives.'}
          </p>
          <Link href="/shop" className="btn">
            Shop all pieces
          </Link>
        </div>
      </section>

      {looks.length > 0 ? (
        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <h2>Shop the look</h2>
                <p>Tap a photo to see the piece.</p>
              </div>
              {ig ? (
                <a className="link" href={`https://www.instagram.com/${ig}/`} rel="noopener">
                  Follow @{ig}
                </a>
              ) : null}
            </div>
            <div className="look-grid">
              {looks.map((l, k) => (
                <Link key={k} href={`/product/${l.product!.slug}`} className="look" aria-label={`Shop ${l.product!.name}`}>
                  <ProductImage img={l.image} alt="" sizes="(min-width: 900px) 16vw, 48vw" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {facts.length > 0 ? (
        <section className="section section--tint" id="facts">
          <div className="wrap facts">
            {facts.map((f) => (
              <div key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
