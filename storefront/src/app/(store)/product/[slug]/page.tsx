import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductGrid } from '@/components/Catalogue'
import { Gallery } from '@/components/Gallery'
import { ProductBuy } from '@/components/ProductBuy'
import { ProductImage } from '@/components/ProductImage'
import { ProductVideo } from '@/components/ProductVideo'
import { PixelEvent } from '@/components/Tracking'
import { SITE_URL } from '@/lib/config'
import { getProductBySlug, getProducts, getSettings } from '@/lib/data'
import { discountPercent, formatPKR } from '@/lib/format'
import { deliveryNote } from '@/lib/pricing'
import { isSoldOut } from '@/lib/product'
import { imageUrl } from '@/lib/sanity'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    return (await getProducts()).map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = await getProductBySlug(slug)
  if (!p) return {}
  const description = p.description?.slice(0, 160) || `${p.name}${p.fabric ? ', ' + p.fabric : ''}. ${formatPKR(p.price)}. Cash on delivery.`
  const og = p.images?.[0] ? [{ url: imageUrl(p.images[0], 1200, 630), width: 1200, height: 630, alt: p.name }] : undefined
  return { title: p.name, description, openGraph: { title: p.name, description, images: og } }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [product, settings, all] = await Promise.all([getProductBySlug(slug), getSettings(), getProducts()])
  if (!product) notFound()

  const out = isSoldOut(product)
  const off = discountPercent(product.price, product.compareAtPrice)
  const first = product.collections?.[0]
  // Same collection first, then anything else, so the row is never nearly empty.
  const sameCollection = all.filter((p) => p._id !== product._id && first && p.collections?.some((c) => c.slug === first.slug))
  const rest = all.filter((p) => p._id !== product._id && !sameCollection.includes(p))
  const related = [...sameCollection, ...rest].slice(0, 4)
  const images = product.images && product.images.length > 0 ? product.images : [undefined]
  const hasSizes = (product.sizes?.length ?? 0) > 0

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    sku: product._id,
    image: (product.images ?? []).map((i) => imageUrl(i, 1000, 1250)),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: product.price,
      availability: out ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: `${SITE_URL}/product/${product.slug}`,
    },
  }

  return (
    <div className="wrap pdp-wrap">
      <PixelEvent
        event="ViewContent"
        data={{ content_ids: [product._id], content_name: product.name, content_type: 'product', value: product.price, currency: 'PKR' }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true"> / </span>
        {first ? (
          <>
            <Link href={`/collections/${first.slug}`}>{first.title}</Link>
            <span aria-hidden="true"> / </span>
          </>
        ) : null}
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="pdp">
        <Gallery count={images.length + (product.video ? 1 : 0)}>
          {images.map((img, i) => [
            i === 1 && product.video ? (
              <figure key="video" className="fig--video">
                <ProductVideo src={product.video} label={`${product.name}, video`} />
              </figure>
            ) : null,
            <figure key={i}>
              <ProductImage
                img={img}
                alt={img?.alt || (i === 0 ? product.name : `${product.name}, photo ${i + 1}`)}
                tone={product.tone}
                priority={i === 0}
                sizes="(min-width: 900px) 34vw, 86vw"
              />
            </figure>,
          ])}
          {images.length < 2 && product.video ? (
            <figure className="fig--video">
              <ProductVideo src={product.video} label={`${product.name}, video`} />
            </figure>
          ) : null}
        </Gallery>

        <div className="info">
          <h1>{product.name}</h1>
          {product.fabric ? <p className="fab">{product.fabric}</p> : null}
          <p className="price price--big">
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <>
                <span className="now">{formatPKR(product.price)}</span>
                <s>{formatPKR(product.compareAtPrice)}</s>
                {off ? <span className="off">{off}% off</span> : null}
              </>
            ) : (
              formatPKR(product.price)
            )}
          </p>
          <p className="model-note">Model is wearing size {product.modelSize || settings.modelSize || 'Small'}.</p>

          <ProductBuy
            id={product._id}
            slug={product.slug}
            name={product.name}
            price={product.price}
            sizes={product.sizes ?? []}
            soldOutSizes={product.soldOutSizes ?? []}
            soldOut={out}
            customFee={product.customSize ? settings.customSizeFee ?? 0 : 0}
          />

          <div className="acc">
            {product.description || (product.details && product.details.length > 0) ? (
              <details open>
                <summary>Description</summary>
                <div className="acc__body">
                  {product.description ? <p className="pre">{product.description}</p> : null}
                  {product.details && product.details.length > 0 ? (
                    <ul>
                      {product.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </details>
            ) : null}
            {hasSizes ? (
              <details id="size-chart">
                <summary>Size chart</summary>
                <div className="acc__body">
                  {settings.sizeChart ? (
                    <ProductImage img={settings.sizeChart} alt={settings.sizeChart.alt || 'Size chart'} sizes="(min-width: 900px) 34vw, 90vw" className="chart" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="chart-img" src="/brand/size-chart.jpg" alt="Vastré size chart: shirt shoulder, bust, hip and sleeve length, and trouser hip, thigh, bottom and length, in inches, for sizes XS to L" width={1024} height={1536} loading="lazy" />
                  )}
                </div>
              </details>
            ) : null}
            <details>
              <summary>Delivery and exchange</summary>
              <div className="acc__body">
                <ul>
                  {settings.codNote ? <li>{settings.codNote}</li> : null}
                  {settings.deliveryTime ? <li>{settings.deliveryTime}</li> : null}
                  <li>
                    {deliveryNote(settings)}
                    {settings.freeDeliveryOver && settings.deliveryFee > 0 ? `, free over ${formatPKR(settings.freeDeliveryOver)}` : ''}
                  </li>
                  {settings.returnSummary ? <li>{settings.returnSummary}</li> : null}
                </ul>
                {settings.deliveryPolicy || settings.returnPolicy ? (
                  <p>
                    {settings.deliveryPolicy ? <Link href="/policies/delivery">Delivery policy</Link> : null}
                    {settings.deliveryPolicy && settings.returnPolicy ? ' and ' : null}
                    {settings.returnPolicy ? <Link href="/policies/returns">return policy</Link> : null}
                  </p>
                ) : null}
              </div>
            </details>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="section section--flush" aria-labelledby="related-title">
          <div className="sec-head">
            <h2 id="related-title">You may also like</h2>
          </div>
          <ProductGrid products={related} />
        </section>
      ) : null}
      <div className="buybar-spacer" aria-hidden="true" />
    </div>
  )
}
