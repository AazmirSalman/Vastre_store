/**
 * ONE-TIME content import. Remove this folder and public/_import after the store is loaded.
 * Needs SANITY_WRITE_TOKEN in the host's environment variables and the one-time key in ?key=.
 * Steps (call in order): ?step=collections, ?step=product&i=0..17, ?step=settings
 */
import { createHash } from 'node:crypto'
import { createClient } from '@sanity/client'
import { NextResponse } from 'next/server'
import { SANITY_DATASET, SANITY_PROJECT_ID } from '@/lib/config'
import data from './data.json'

export const dynamic = 'force-dynamic'

const KEY_HASH = 'c896c72ce8a0a0bca1821af38798ae3ed04e6a7038c11a53a779a19fdd2f4dda'
const SIZES = ['XS', 'S', 'M', 'L', 'XL']

type Client = ReturnType<typeof createClient>
const k = (i: number) => `k${i}${Math.random().toString(36).slice(2, 8)}`
const ref = (_ref: string) => ({ _type: 'reference', _ref })

async function upload(client: Client, origin: string, file: string): Promise<string> {
  const res = await fetch(`${origin}/_import/${encodeURIComponent(file)}`)
  if (!res.ok) throw new Error(`Could not read ${file} (${res.status})`)
  const buf = Buffer.from(await res.arrayBuffer())
  const asset = await client.assets.upload('image', buf, { filename: file, contentType: 'image/jpeg' })
  return asset._id
}

const img = (assetId: string, hotY?: number) => ({
  _type: 'image',
  asset: ref(assetId),
  ...(hotY !== undefined ? { hotspot: { _type: 'sanity.imageHotspot', x: 0.5, y: hotY, width: 1, height: 1 } } : {}),
})

/** Uses a collection the owner already made (same name), otherwise a fixed id, so running twice never duplicates. */
async function collectionId(client: Client, title: string, slug: string): Promise<string> {
  const found = await client.fetch<string | null>(
    `*[_type == "collection" && (lower(title) == lower($title) || slug.current == $slug) && !(_id in path("drafts.**"))][0]._id`,
    { title, slug },
  )
  return found || `collection-${slug}`
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const key = url.searchParams.get('key') || ''
  if (createHash('sha256').update(key).digest('hex') !== KEY_HASH) return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  const token = process.env.SANITY_WRITE_TOKEN
  if (!token || !SANITY_PROJECT_ID) return NextResponse.json({ error: 'SANITY_WRITE_TOKEN is not set on the host' }, { status: 500 })
  const client = createClient({ projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET, apiVersion: '2025-02-19', token, useCdn: false })
  const origin = url.origin
  const step = url.searchParams.get('step')

  try {
    if (step === 'collections') {
      const out: string[] = []
      for (const c of data.collections) {
        const id = await collectionId(client, c.title, c.slug)
        const asset = await upload(client, origin, c.image)
        await client.createIfNotExists({ _id: id, _type: 'collection', title: c.title })
        await client
          .patch(id)
          .set({ title: c.title, slug: { _type: 'slug', current: c.slug }, description: c.description, image: img(asset), sortOrder: c.sortOrder })
          .commit()
        await client.delete(`drafts.${id}`).catch(() => null)
        out.push(`${c.title} -> ${id}`)
      }
      return NextResponse.json({ ok: true, step, out })
    }

    if (step === 'product') {
      const i = Number(url.searchParams.get('i'))
      const p = data.products[i]
      if (!p) return NextResponse.json({ error: 'No product at that index' }, { status: 400 })
      const coll = data.collections.find((c) => c.slug === p.collection)!
      const cid = await collectionId(client, coll.title, coll.slug)
      const assets: string[] = []
      for (const f of p.photos) assets.push(await upload(client, origin, f))
      const existing = await client.fetch<string | null>(`*[_type == "product" && slug.current == $s && !(_id in path("drafts.**"))][0]._id`, { s: p.slug })
      const id = existing || `product-${p.slug}`
      await client.createOrReplace({
        _id: id,
        _type: 'product',
        name: p.name,
        slug: { _type: 'slug', current: p.slug },
        price: p.price,
        images: assets.map((a, n) => ({ ...img(a), _key: k(n) })),
        collections: [{ ...ref(cid), _key: k(0) }],
        fabric: p.fabric,
        description: p.description,
        details: p.details,
        sizes: SIZES,
        soldOutSizes: [],
        customSize: p.customSize,
        soldOut: false,
        featured: p.featured,
        ...(p.badge ? { badge: p.badge } : {}),
      })
      await client.delete(`drafts.${id}`).catch(() => null)
      return NextResponse.json({ ok: true, step, product: p.name, id, photos: assets.length })
    }

    if (step === 'settings') {
      const ids = new Map<string, string>()
      for (const c of data.collections) ids.set(c.slug, await collectionId(client, c.title, c.slug))
      const slides = []
      for (const [n, s] of data.slides.entries()) {
        const a = await upload(client, origin, s.image)
        slides.push({ _key: k(n), _type: 'heroSlide', image: img(a, s.hotY), title: s.title, text: s.text, buttonText: s.buttonText, collection: ref(ids.get(s.collection)!) })
      }
      const looks = []
      for (const [n, l] of data.looks.entries()) {
        const a = await upload(client, origin, l.image)
        const pid = await client.fetch<string>(`*[_type == "product" && slug.current == $s && !(_id in path("drafts.**"))][0]._id`, { s: l.product })
        looks.push({ _key: k(n), _type: 'look', image: img(a), product: ref(pid) })
      }
      const story = await upload(client, origin, data.story)
      await client.createIfNotExists({ _id: 'siteSettings', _type: 'siteSettings', storeName: 'Vastré', deliveryFee: 550 })
      await client
        .patch('siteSettings')
        .set({
          storeName: 'Vastré',
          tagline: "Ladies' eastern wear",
          announcement: 'Cash on delivery across Pakistan',
          heroText: "Ladies' eastern wear in georgette, velvet and silk. Cash on delivery across Pakistan.",
          heroSlides: slides,
          lookbook: looks,
          storyImage: img(story),
          storyTitle: 'Eastern wear, cut for the way you wear it',
          storyText: 'Every piece is photographed on a real shoot and sent out carefully packed. Order online, we confirm on WhatsApp, and you pay when it arrives.',
          deliveryFee: 550,
          localCity: 'Lahore',
          localDeliveryFee: 350,
          customSizeFee: 10000,
          deliveryTime: 'Delivered in 3 to 5 working days via TCS, Leopards or PostEx',
          returnSummary: 'Damaged, defective or wrong item? Tell us within 48 hours of delivery.',
          codNote: 'Pay the rider in cash when your parcel arrives.',
          whatsappNumber: '923087333375',
          instagram: 'vastre.pk',
          email: 'vastreclothing786@gmail.com',
          returnPolicy:
            'We do not offer refunds or returns for change of mind, incorrect size selection, or personal preference.\n\nIf you receive a damaged, defective, or incorrect item, please contact us on WhatsApp within 48 hours of delivery, with clear photographs and your order details.\n\nOnce the issue has been verified, VASTRÉ will arrange an appropriate resolution, which may include a replacement or refund where applicable.',
          deliveryPolicy:
            'We deliver across Pakistan through TCS, Leopards and PostEx. Delivery charge: Rs. 350 within Lahore and Rs. 550 for all other cities. Orders are delivered in 3 to 5 working days after we confirm them on WhatsApp. Pay the rider in cash when your parcel arrives.\n\nCustom sizes are available on most pieces for Rs. 10,000 extra: choose Custom as the size and add your measurements at checkout.',
        })
        .commit()
      await client.delete('drafts.siteSettings').catch(() => null)
      return NextResponse.json({ ok: true, step, slides: slides.length, looks: looks.length })
    }

    if (step === 'cleanup') {
      // A duplicate "Elara" made by hand before the import (web address 01-elara).
      const dupes = await client.fetch<string[]>(`*[_type == "product" && slug.current == "01-elara"]._id`)
      for (const id of dupes) {
        await client.delete(id)
        await client.delete(`drafts.${id}`).catch(() => null)
      }
      return NextResponse.json({ ok: true, step, deleted: dupes })
    }

    return NextResponse.json({ error: 'Unknown step' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 502 })
  }
}
