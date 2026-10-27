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
