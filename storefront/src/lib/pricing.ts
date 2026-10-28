import { getProductsByIds, getSettings } from './data'
import { imageUrl } from './sanity'
import { formatPKR } from './format'
import type { CartLine, Quote, QuoteLine, Settings } from './types'

export const MAX_QTY = 10
export const MAX_LINES = 20
import { CUSTOM } from './customSize'
export { CUSTOM }

const squash = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '')

/** True when the address is in the cheaper delivery city ("DHA Lahore", "lahore cantt" and so on all count). */
export function isLocalCity(city: string | undefined, settings: Settings): boolean {
  const local = squash(settings.localCity || '')
  return !!local && !!city && squash(city).includes(local)
}

function hasCityRate(s: Settings): boolean {
  return !!s.localCity && typeof s.localDeliveryFee === 'number' && s.localDeliveryFee !== s.deliveryFee
}

export function deliveryNote(s: Settings): string {
  const fee = (n: number) => (n > 0 ? formatPKR(n) : 'free')
  if (hasCityRate(s)) return `Delivery ${fee(s.localDeliveryFee!)} in ${s.localCity}, ${fee(s.deliveryFee)} to other cities`
  return s.deliveryFee > 0 ? `Delivery ${formatPKR(s.deliveryFee)}` : 'Free delivery'
}

/**
 * Single source of truth for prices. The browser sends only product ids, sizes and quantities;
 * prices, stock and delivery fees are always recalculated here from the catalogue.
 */
export async function priceCart(input: CartLine[], city?: string): Promise<Quote> {
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
    const custom = item.size === CUSTOM
    const customFee = settings.customSizeFee ?? 0
    const unitPrice = custom && p.customSize && customFee > 0 ? p.price + customFee : p.price
    const base = {
      id: p._id,
      slug: p.slug,
      name: p.name,
      size: item.size,
      qty,
      unitPrice,
      lineTotal: unitPrice * qty,
      image: p.images?.[0] ? imageUrl(p.images[0], 160, 200) : undefined,
    }
    const sizes = p.sizes ?? []
    if (p.soldOut) return { ...base, ok: false, problem: 'Sold out. Remove it to continue.' }
    if (custom) {
      if (!p.customSize || customFee <= 0) return { ...base, ok: false, problem: 'Custom size is not offered for this piece. Remove it to continue.' }
      return { ...base, ok: true }
    }
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
  const byCity = hasCityRate(settings)
  const cityKnown = !byCity || !!(city && city.trim().length >= 2)
  const rate = byCity && isLocalCity(city, settings) ? settings.localDeliveryFee! : settings.deliveryFee
  const deliveryFee = subtotal === 0 ? 0 : freeOver !== null && subtotal >= freeOver ? 0 : rate
  return {
    cityKnown,
    deliveryNote: deliveryNote(settings),
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
