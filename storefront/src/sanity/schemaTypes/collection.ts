import { defineField, defineType } from 'sanity'

export const collection = defineType({
  name: 'collection',
  title: 'Collection',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Collection name',
      type: 'string',
      description: 'For example "Lawn", "Formals" or "Winter".',
      validation: (r) => r.required().max(40),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description: 'Press "Generate".',
      options: { source: 'title', maxLength: 40 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      title: 'Short description',
      type: 'string',
      description: 'One line shown at the top of the collection page.',
    }),
    defineField({
      name: 'image',
      title: 'Cover photo',
      type: 'image',
      description: 'Shown inside the arch on the home page. A tall photo works best.',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Short description of the photo (optional)', type: 'string' })],
    }),
    defineField({
      name: 'sortOrder',
      title: 'Position',
      type: 'number',
      description: 'Smaller numbers come first (1, 2, 3...). Collections without a number are listed alphabetically after them.',
    }),
  ],
  orderings: [{ title: 'Position', name: 'position', by: [{ field: 'sortOrder', direction: 'asc' }] }],
  preview: { select: { title: 'title', media: 'image' } },
})
