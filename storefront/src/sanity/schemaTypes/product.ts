import { defineArrayMember, defineField, defineType } from 'sanity'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Product name',
      type: 'string',
      description: 'Shown to customers, e.g. "Embroidered Lawn 3-Piece".',
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description: 'Press "Generate". This becomes the product link. Do not change it after you share the link.',
      options: { source: 'name', maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price (Rs.)',
      type: 'number',
      description: 'Numbers only, for example 4500.',
      validation: (r) => r.required().integer().min(1),
    }),
    defineField({
      name: 'compareAtPrice',
      title: 'Old price (Rs.), only for a sale',
      type: 'number',
      description: 'Fill this in only when the product is on sale. It shows crossed out next to the price. Leave empty otherwise.',
      validation: (r) =>
        r
          .integer()
          .min(1)
          .custom((value, context) => {
            const price = (context.document as { price?: number } | undefined)?.price
            if (value && price && value <= price) return 'The old price must be higher than the price.'
            return true
          }),
    }),
    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      description: 'The first photo is the main one. Tall (portrait) photos work best. Drag to change the order.',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Short description of the photo (optional)', type: 'string' })],
        }),
      ],
      validation: (r) => r.required().min(1).max(8),
    }),
    defineField({
      name: 'collections',
      title: 'Collections',
      type: 'array',
      description: 'Where this product appears, for example Lawn or Formals.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'collection' }] })],
    }),
    defineField({
      name: 'fabric',
      title: 'Fabric line',
      type: 'string',
      description: 'Shown under the name, e.g. "Lawn, unstitched".',
    }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
    defineField({
      name: 'details',
      title: 'Details list',
      type: 'array',
      description: 'One short line each, e.g. "Shirt, dupatta and trouser" or "Dry clean only".',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'sizes',
      title: 'Sizes offered',
      type: 'array',
      description: 'Tick the sizes you sell. Leave all empty for unstitched or one-size pieces.',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: SIZES, layout: 'grid' },
    }),
    defineField({
      name: 'soldOutSizes',
      title: 'Sizes that are sold out',
      type: 'array',
      description: 'Tick a size when it runs out. Customers can still order the other sizes.',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: SIZES, layout: 'grid' },
      hidden: ({ document }) => !((document?.sizes as string[] | undefined)?.length ?? 0),
    }),
    defineField({
      name: 'soldOut',
      title: 'Sold out',
      type: 'boolean',
      description: 'Turn on when nothing is left. The product stays visible but cannot be ordered.',
      initialValue: false,
    }),
    defineField({
      name: 'featured',
      title: 'Show on the home page',
      type: 'boolean',
      description: 'Featured products appear under "Our picks" on the home page. With fewer than 4, the newest products show instead.',
      initialValue: false,
    }),
    defineField({
      name: 'badge',
      title: 'Small label on the photo',
      type: 'string',
      description: 'Optional, e.g. "New" or "Limited".',
      validation: (r) => r.max(14),
    }),
  ],
  orderings: [
    { title: 'Newest first', name: 'newest', by: [{ field: '_createdAt', direction: 'desc' }] },
    { title: 'Name A to Z', name: 'name', by: [{ field: 'name', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', price: 'price', media: 'images.0', soldOut: 'soldOut' },
    prepare({ title, price, media, soldOut }) {
      return { title, subtitle: `${soldOut ? 'SOLD OUT, ' : ''}Rs. ${price ?? '?'}`, media }
    },
  },
})
