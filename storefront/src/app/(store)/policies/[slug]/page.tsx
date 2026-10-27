import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSettings } from '@/lib/data'
import type { Settings } from '@/lib/types'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

const PAGES: Record<string, { title: string; field: keyof Settings }> = {
  delivery: { title: 'Delivery', field: 'deliveryPolicy' },
  returns: { title: 'Returns and exchanges', field: 'returnPolicy' },
  about: { title: 'About us', field: 'aboutText' },
  privacy: { title: 'Privacy', field: 'privacyPolicy' },
}

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }))
}

/** Starting text used until the owner writes her own in the Studio. Needs a read-through before launch. */
function defaultPrivacy(name: string): string {
  return [
    `This page explains what ${name} collects when you shop on this website, and how it is used.`,
    `What we collect\nWhen you place an order we collect your name, mobile number, city, delivery address and the items you ordered. We also receive basic visit information, such as the pages you view and the ad or link that brought you here.`,
    `How we use it\nTo confirm and deliver your order, to contact you about it by WhatsApp or phone, and to understand which of our products and ads work.`,
    `Advertising\nWe use the Meta Pixel. It lets Meta (Facebook and Instagram) measure visits and purchases, and show our ads to relevant people. Meta may use cookies for this. You can limit ad tracking in your Facebook, Instagram and browser settings.`,
    `Sharing\nWe share your details only with the courier delivering your order and the services that run this shop. We do not sell your information.`,
    `Your choices\nTo correct or delete your details, message us on WhatsApp.`,
  ].join('\n\n')
}

async function load(slug: string) {
  const page = PAGES[slug]
  if (!page) return null
  const s = await getSettings()
  const raw = s[page.field]
  let body = typeof raw === 'string' ? raw.trim() : ''
  if (!body && slug === 'privacy') body = defaultPrivacy(s.storeName)
  return body ? { title: page.title, body } : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await load(slug)
  return page ? { title: page.title } : {}
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params
  const page = await load(slug)
  if (!page) notFound()
  return (
    <div className="container section">
      <header className="page-head">
        <h1>{page.title}</h1>
      </header>
      <div className="prose pre">{page.body}</div>
    </div>
  )
}
