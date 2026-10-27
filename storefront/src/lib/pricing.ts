import { getProductsByIds, getSettings } from './data'
import { imageUrl } from './sanity'
import type { CartLine, Quote, QuoteLine } from './types'

export const MAX_QTY = 10
export const MAX_LINES = 20

/**
 * Single source of truth for prices. The browser sends only product ids, sizes and quantities;
 * prices, stock and delivery fees are always recalculated here from the catalogue.
 */
export async function priceCart(input: CartLine[]): Promise<Quote> {
  const items = input.slice(0, MAX_LINES)
  const ids = [...new Set(items.map((i) => i.id))]
  const [products, settings] = await Promise.all([getProductsByIds(ids), getSettings()])
  const byId = new Map(products.map((p) => [p._id, p]))

  const lines: QuoteLine[] = items.map((item) => {
    const qty = Math.min(MAX_QTY, Math.max(1, Math.floor(item.qty) || 1))
    const p = byId.get(item.id)
    if (!p) {
      return { id: item.id, slug: '', name: 'Unavailable item', size: item.size, qty, unitPrice: 0, lineTotal: 0, ok: false, problem: 'No longer available. Remove it to continue.' }
    }
    const base = {
      id: p._id,
      slug: p.slug,
      name: p.name,
      size: item.size,
      qty,
      unitPrice: p.price,
      lineTotal: p.price * qty,
      image: p.images?.[0] ? imageUrl(p.images[0], 160, 200) : undefined,
    }
    const sizes = p.sizes ?? []
    if (p.soldOut) return { ...base, ok: false, problem: 'Sold out. Remove it to continue.' }
    if (sizes.length > 0 && (!item.size || !sizes.includes(item.size))) {
      return { ...base, ok: false, problem: 'Choose a size on the product page.' }
    }
    if (item.size && (p.soldOutSizes ?? []).includes(item.size)) {
      return { ...base, ok: false, problem: `Size ${item.size} is sold out. Remove it to continue.` }
    }
    return { ...base, ok: true }
  })

  const subtotal = lines.filter((l) => l.ok).reduce((sum, l) => sum + l.lineTotal, 0)
  const freeOver = settings.freeDeliveryOver && settings.freeDeliveryOver > 0 ? settings.freeDeliveryOver : null
  const deliveryFee = subtotal === 0 ? 0 : freeOver !== null && subtotal >= freeOver ? 0 : settings.deliveryFee
  return {
    lines,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    freeDeliveryOver: freeOver,
    allOk: lines.length > 0 && lines.every((l) => l.ok),
  }
}

/** Reads and validates a cart sent by the browser. Returns null when the shape is wrong. */
export function parseCartLines(raw: unknown): CartLine[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_LINES) return null
  const out: CartLine[] = []
  for (const r of raw) {
    if (!r || typeof r !== 'object') return null
    const { id, size, qty } = r as Record<string, unknown>
    if (typeof id !== 'string' || id.length === 0 || id.length > 120) return null
    if (size !== undefined && size !== null && (typeof size !== 'string' || size.length > 12)) return null
    const q = Number(qty)
    if (!Number.isFinite(q) || q < 1) return null
    out.push({ id, size: typeof size === 'string' && size ? size : undefined, qty: Math.min(MAX_QTY, Math.floor(q)) })
  }
  return out
}
