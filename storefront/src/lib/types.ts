export type Tone = 'plum' | 'teal' | 'rust' | 'blush'

export type Img = {
  asset: { _ref: string }
  hotspot?: { x: number; y: number; height: number; width: number }
  crop?: { top: number; bottom: number; left: number; right: number }
  alt?: string
}

export type CollectionRef = { _id: string; title: string; slug: string }

export type Collection = CollectionRef & {
  description?: string
  image?: Img
  /** Sample data only: colour for the placeholder art. */
  tone?: Tone
}

export type Product = {
  _id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  images?: Img[]
  fabric?: string
  description?: string
  details?: string[]
  sizes?: string[]
  soldOut?: boolean
  soldOutSizes?: string[]
  badge?: string
  featured?: boolean
  collections?: CollectionRef[]
  createdAt?: string
  /** Sample data only: colour for the placeholder art. */
  tone?: Tone
}

export type Settings = {
  storeName: string
  tagline?: string
  announcement?: string
  heroHeadline: string
  heroText?: string
  heroImage?: Img
  heroButton: string
  whatsappNumber?: string
  instagram?: string
  email?: string
  deliveryFee: number
  freeDeliveryOver?: number
  deliveryTime?: string
  returnSummary?: string
  codNote?: string
  sizeChart?: Img
  aboutText?: string
  deliveryPolicy?: string
  returnPolicy?: string
  privacyPolicy?: string
  metaPixelId?: string
}

/** What the browser stores for each cart line. Prices always come from the server. */
export type CartLine = { id: string; size?: string; qty: number }

export type QuoteLine = {
  id: string
  slug: string
  name: string
  size?: string
  qty: number
  unitPrice: number
  lineTotal: number
  image?: string
  ok: boolean
  problem?: string
}

export type Quote = {
  lines: QuoteLine[]
  subtotal: number
  deliveryFee: number
  total: number
  freeDeliveryOver: number | null
  allOk: boolean
}
