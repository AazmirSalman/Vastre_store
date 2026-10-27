import { imageSrcSet, imageUrl } from '@/lib/sanity'
import type { Img, Tone } from '@/lib/types'
import { Art } from './Art'

type Props = {
  img?: Img
  alt: string
  tone?: Tone
  sizes: string
  priority?: boolean
  className?: string
}

const WIDTHS = [320, 480, 640, 800, 1000, 1200]
/** Height divided by width: every product and collection photo is shown 3:4 (portrait). */
const RATIO = 4 / 3

/** 3:4 photo from the CDN, cropped around the hotspot set in the panel, or a quiet placeholder when there is no photo yet. */
export function ProductImage({ img, alt, tone, sizes, priority = false, className = '' }: Props) {
  if (!img) return <Art tone={tone} className={className} />
  return (
    // Plain <img>: Sanity's CDN already resizes and compresses, so the host's image quota is not used.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`photo ${className}`.trim()}
      src={imageUrl(img, 640, Math.round(640 * RATIO))}
      srcSet={imageSrcSet(img, WIDTHS, RATIO)}
      sizes={sizes}
      alt={alt}
      width={640}
      height={Math.round(640 * RATIO)}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
    />
  )
}
