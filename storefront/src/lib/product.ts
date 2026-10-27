import type { Product } from './types'

/** A product is sold out if it is marked so, or if every size is sold out. */
export function isSoldOut(p: Pick<Product, 'soldOut' | 'sizes' | 'soldOutSizes'>): boolean {
  if (p.soldOut) return true
  const sizes = p.sizes ?? []
  return sizes.length > 0 && sizes.every((s) => (p.soldOutSizes ?? []).includes(s))
}
