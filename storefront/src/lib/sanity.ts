import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
import { IS_SAMPLE, SANITY_DATASET, SANITY_PROJECT_ID } from './config'
import type { Img } from './types'

export const client = IS_SAMPLE
  ? null
  : createClient({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      apiVersion: '2025-02-19',
      useCdn: true,
    })

const builder = IS_SAMPLE ? null : createImageUrlBuilder({ projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET })

/** Sanity serves resized, compressed images from its CDN, so no image-processing quota is used on the host. */
export function imageUrl(img: Img, width: number, height?: number): string {
  if (!builder) return ''
  let b = builder.image(img).width(width).auto('format').quality(80)
  if (height) b = b.height(height).fit('crop')
  return b.url()
}

export function imageSrcSet(img: Img, widths: number[], ratio = 1.25): string {
  return widths.map((w) => `${imageUrl(img, w, Math.round(w * ratio))} ${w}w`).join(', ')
}

/** A wide photo for the hero, not cropped to a fixed shape. */
export function wideUrl(img: Img, width: number): string {
  if (!builder) return ''
  return builder.image(img).width(width).auto('format').quality(78).url()
}

/** Where to keep the photo centred when the screen crops it: the hotspot set in the panel, or the upper middle. */
export function focus(img?: Img): string {
  const h = img?.hotspot
  return h ? `${Math.round(h.x * 100)}% ${Math.round(h.y * 100)}%` : '50% 25%'
}

/** On phones the hero text covers the lower half, so show more of the photo below the focus point, keeping faces above the text. */
export function focusPhone(img?: Img): string {
  const h = img?.hotspot
  const x = h ? Math.round(h.x * 100) : 50
  const y = h ? Math.min(100, Math.round(h.y * 100) + 45) : 70
  return `${x}% ${y}%`
}
