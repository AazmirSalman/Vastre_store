import type { Collection, Product, Settings } from './types'

/**
 * Preview content. Used only while no Sanity project is connected
 * (NEXT_PUBLIC_SANITY_PROJECT_ID is empty). Replace it by connecting the Studio.
 */

export const SAMPLE_SETTINGS: Settings = {
  storeName: 'Vastre',
  tagline: "Ladies' eastern wear",
  announcement: 'Cash on delivery across Pakistan',
  heroHeadline: 'Eastern wear, cut for the way you wear it',
  heroText: 'Lawn for the everyday, chiffon for the occasion, khaddar for the cold. Choose your piece and order in a minute.',
  heroButton: 'Shop new arrivals',
  instagram: 'vastre.pk',
  deliveryFee: 550,
  localCity: 'Lahore',
  localDeliveryFee: 350,
  customSizeFee: 10000,
  deliveryTime: 'Delivered in 3 to 5 working days',
  returnSummary: 'Size exchange within 7 days of delivery',
  codNote: 'Pay the rider in cash when your parcel arrives.',
  aboutText:
    'Vastre makes ladies’ eastern wear for Pakistan. This is sample text. Replace it in the Studio under Site settings.',
  deliveryPolicy: 'Sample text. Add your delivery policy in the Studio under Site settings.',
  returnPolicy: 'Sample text. Add your return and exchange policy in the Studio under Site settings.',
}

export const SAMPLE_COLLECTIONS: Collection[] = [
  { _id: 'sample-c-lawn', title: 'Lawn', slug: 'lawn', description: 'Light, breathable pieces for every day.', tone: 'plum' },
  { _id: 'sample-c-formals', title: 'Formals', slug: 'formals', description: 'Chiffon and organza for weddings and Eid.', tone: 'teal' },
  { _id: 'sample-c-winter', title: 'Winter', slug: 'winter', description: 'Khaddar and linen for the cold months.', tone: 'rust' },
  { _id: 'sample-c-kurtas', title: 'Kurtas', slug: 'kurtas', description: 'Ready to wear, easy to style.', tone: 'blush' },
]

const ref = (slug: string) => {
  const c = SAMPLE_COLLECTIONS.find((x) => x.slug === slug)!
  return { _id: c._id, title: c.title, slug: c.slug }
}

const STITCHED = ['S', 'M', 'L', 'XL']

export const SAMPLE_PRODUCTS: Product[] = [
  {
    _id: 'sample-p-1', name: 'Embroidered Lawn 3-Piece', slug: 'embroidered-lawn-3-piece', price: 4800, compareAtPrice: 5600,
    fabric: 'Lawn, unstitched', tone: 'plum', featured: true, badge: 'New', collections: [ref('lawn')],
    description: 'Sample product. Embroidered shirt, printed dupatta and plain trouser.',
    details: ['Shirt, dupatta and trouser', 'Unstitched', 'Machine wash cold'], createdAt: '2026-10-01T00:00:00Z',
  },
  {
    _id: 'sample-p-2', name: 'Printed Lawn 2-Piece', slug: 'printed-lawn-2-piece', price: 3200,
    fabric: 'Lawn, stitched', tone: 'teal', featured: true, customSize: true, sizes: STITCHED, soldOutSizes: ['S'], collections: [ref('lawn')],
    description: 'Sample product. Printed shirt with matching trouser.', details: ['Shirt and trouser', 'Stitched', 'Machine wash cold'], createdAt: '2026-09-28T00:00:00Z',
  },
  {
    _id: 'sample-p-3', name: 'Chiffon Embroidered Formal', slug: 'chiffon-embroidered-formal', price: 11500,
    fabric: 'Chiffon, stitched', tone: 'teal', featured: true, badge: 'New', sizes: STITCHED, collections: [ref('formals')],
    description: 'Sample product. Embroidered chiffon shirt with raw silk trouser and net dupatta.', details: ['Shirt, dupatta and trouser', 'Stitched', 'Dry clean only'], createdAt: '2026-09-25T00:00:00Z',
  },
  {
    _id: 'sample-p-4', name: 'Organza Festive Set', slug: 'organza-festive-set', price: 14800,
    fabric: 'Organza, stitched', tone: 'plum', featured: true, sizes: STITCHED, soldOut: true, collections: [ref('formals')],
    description: 'Sample product. Organza shirt with embroidered border.', details: ['Shirt, dupatta and trouser', 'Stitched', 'Dry clean only'], createdAt: '2026-09-20T00:00:00Z',
  },
  {
    _id: 'sample-p-5', name: 'Khaddar Winter 3-Piece', slug: 'khaddar-winter-3-piece', price: 5900,
    fabric: 'Khaddar, unstitched', tone: 'rust', featured: true, collections: [ref('winter')],
    description: 'Sample product. Printed khaddar shirt, wool shawl and khaddar trouser.', details: ['Shirt, shawl and trouser', 'Unstitched', 'Machine wash cold'], createdAt: '2026-09-18T00:00:00Z',
  },
  {
    _id: 'sample-p-6', name: 'Linen Kurta', slug: 'linen-kurta', price: 3600,
    fabric: 'Linen, stitched', tone: 'rust', sizes: STITCHED, collections: [ref('winter'), ref('kurtas')],
    description: 'Sample product. Straight-cut linen kurta with a side slit.', details: ['Kurta only', 'Stitched', 'Machine wash cold'], createdAt: '2026-09-12T00:00:00Z',
  },
  {
    _id: 'sample-p-7', name: 'Everyday Cotton Kurta', slug: 'everyday-cotton-kurta', price: 2400,
    fabric: 'Cotton, stitched', tone: 'blush', sizes: STITCHED, collections: [ref('kurtas')],
    description: 'Sample product. Soft cotton kurta for daily wear.', details: ['Kurta only', 'Stitched', 'Machine wash'], createdAt: '2026-09-05T00:00:00Z',
  },
  {
    _id: 'sample-p-8', name: 'Block Print Kurta Set', slug: 'block-print-kurta-set', price: 4200,
    fabric: 'Cotton, stitched', tone: 'blush', sizes: STITCHED, collections: [ref('kurtas'), ref('lawn')],
    description: 'Sample product. Block-printed kurta with plain cotton trouser.', details: ['Kurta and trouser', 'Stitched', 'Machine wash cold'], createdAt: '2026-08-30T00:00:00Z',
  },
]
