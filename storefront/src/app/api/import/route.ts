/**
 * ONE-TIME video import. Remove this folder and public/_import once the videos are in the panel.
 * Needs SANITY_WRITE_TOKEN in the host's environment variables and the one-time key in ?key=.
 * Steps: ?step=video&i=0..17 (one product each), then ?step=home
 */
import { createHash } from 'node:crypto'
import { createClient } from '@sanity/client'
import { NextResponse } from 'next/server'
import { SANITY_DATASET, SANITY_PROJECT_ID } from '@/lib/config'

export const dynamic = 'force-dynamic'

const KEY_HASH = 'c896c72ce8a0a0bca1821af38798ae3ed04e6a7038c11a53a779a19fdd2f4dda'

/** Which clip goes with which product (web address -> file). Shared clips show a set worn together. */
const VIDEOS: [string, string][] = [
  ['elara', 'elara.mp4'],
  ['sapphire', 'sapphire.mp4'],
  ['roselle', 'roselle.mp4'],
  ['serene', 'serene.mp4'],
  ['lilac-haze', 'contrast-trio.mp4'],
  ['azure-muse', 'contrast-trio.mp4'],
  ['rose-bloom', 'contrast-trio.mp4'],
  ['noire', 'noire.mp4'],
  ['mahogany', 'mahogany.mp4'],
  ['rouge-royale', 'rouge-royale.mp4'],
  ['violetta', 'violetta.mp4'],
  ['rose-royale', 'velvet-pink-olive.mp4'],
  ['olive', 'velvet-pink-olive.mp4'],
  ['cocoa', 'gauze-duo.mp4'],
  ['dune', 'gauze-duo.mp4'],
  ['nude-muse', 'pashmina-trio.mp4'],
  ['amethyst', 'pashmina-trio.mp4'],
  ['sylva', 'pashmina-trio.mp4'],
]

type Client = ReturnType<typeof createClient>

async function upload(client: Client, origin: string, file: string): Promise<string> {
  const res = await fetch(`${origin}/_import/${encodeURIComponent(file)}`)
  if (!res.ok) throw new Error(`Could not read ${file} (${res.status})`)
  const buf = Buffer.from(await res.arrayBuffer())
  // Sanity keeps one copy of identical files, so a clip shared by three products is stored once.
  const asset = await client.assets.upload('file', buf, { filename: file, contentType: 'video/mp4' })
  return asset._id
}

const fileField = (assetId: string) => ({ _type: 'file', asset: { _type: 'reference', _ref: assetId } })

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
    if (step === 'video') {
      const i = Number(url.searchParams.get('i'))
      const entry = VIDEOS[i]
      if (!entry) return NextResponse.json({ error: 'No product at that index' }, { status: 400 })
      const [slug, file] = entry
      const id = await client.fetch<string | null>(`*[_type == "product" && slug.current == $s && !(_id in path("drafts.**"))][0]._id`, { s: slug })
      if (!id) return NextResponse.json({ error: `No published product with web address ${slug}` }, { status: 404 })
      const asset = await upload(client, origin, file)
      await client.patch(id).set({ video: fileField(asset) }).commit()
      // If she has unsaved edits open on this product, give the draft the video too so publishing keeps it.
      const draft = await client.getDocument(`drafts.${id}`)
      if (draft) await client.patch(`drafts.${id}`).set({ video: fileField(asset) }).commit()
      return NextResponse.json({ ok: true, step, slug, file, asset })
    }

    if (step === 'home') {
      const phone = await upload(client, origin, 'home-phone.mp4')
      const wide = await upload(client, origin, 'home-desktop.mp4')
      const set = { heroVideo: fileField(phone), heroVideoWide: fileField(wide) }
      await client.patch('siteSettings').set(set).commit()
      const draft = await client.getDocument('drafts.siteSettings')
      if (draft) await client.patch('drafts.siteSettings').set(set).commit()
      return NextResponse.json({ ok: true, step, phone, wide })
    }

    return NextResponse.json({ error: 'Unknown step' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 502 })
  }
}
