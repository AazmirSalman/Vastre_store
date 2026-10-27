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

const WIDTHS = [320, 480, 640, 800, 1000]

/** 4:5 photo from the CDN, or the placeholder art when no photo exists. */
export function ProductImage({ img, alt, tone, sizes, priority = false, className = '' }: Props) {
  if (!img) return <Art tone={tone} className={className} />
  return (
    // Plain <img>: Sanity's CDN already resizes and compresses, so the host's image quota is not used.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`photo ${className}`.trim()}
      src={imageUrl(img, 640, 800)}
      srcSet={imageSrcSet(img, WIDTHS)}
      sizes={sizes}
      alt={alt}
      width={640}
      height={800}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
    />
  )
}
