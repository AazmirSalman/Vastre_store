import { defineField, defineType } from 'sanity'

/**
 * One customer order. The website creates these; the owner only moves the status along
 * and adds notes and tracking. Orders are stored under the "orders." ID path, which keeps
 * them private: the store's data is public, but anything with a dot in its ID needs a login.
 */
export const ORDER_STATUSES = [
  { title: 'Awaiting payment', value: 'awaiting_payment' },
  { title: 'Paid', value: 'paid' },
  { title: 'In production', value: 'in_production' },
  { title: 'Shipped', value: 'shipped' },
  { title: 'Delivered', value: 'delivered' },
  { title: 'Cancelled', value: 'cancelled' },
]

const statusTitle = (v?: string) => ORDER_STATUSES.find((s) => s.value === v)?.title || 'New'

const rs = (n?: number) => (typeof n === 'number' ? `Rs. ${n.toLocaleString('en-PK')}` : '')

export const order = defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  groups: [
    { name: 'manage', title: 'Manage', default: true },
    { name: 'details', title: 'Order details' },
  ],
  fields: [
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'manage',
      options: { list: ORDER_STATUSES, layout: 'radio' },
      initialValue: 'awaiting_payment',
      description: 'Move the order along as it happens: Paid when the payment screenshot is checked, then In production, Shipped, Delivered.',
    }),
    defineField({ name: 'paidAt', title: 'Payment received on', type: 'date', group: 'manage' }),
    defineField({ name: 'courier', title: 'Courier', type: 'string', group: 'manage', options: { list: ['TCS', 'Leopards', 'PostEx', 'Other'] } }),
    defineField({ name: 'trackingNumber', title: 'Tracking number', type: 'string', group: 'manage' }),
    defineField({ name: 'adminNotes', title: 'Your notes', type: 'text', rows: 3, group: 'manage', description: 'Only you see these. e.g. "Screenshot received on WhatsApp", "Customer wants delivery after the 15th".' }),

    defineField({ name: 'ref', title: 'Order number', type: 'string', group: 'details', readOnly: true }),
    defineField({ name: 'placedAt', title: 'Placed on', type: 'datetime', group: 'details', readOnly: true }),
    defineField({
      name: 'customer',
      title: 'Customer',
      type: 'object',
      group: 'details',
      readOnly: true,
      fields: [
        defineField({ name: 'name', title: 'Name', type: 'string' }),
        defineField({ name: 'phone', title: 'Phone', type: 'string' }),
        defineField({ name: 'city', title: 'City', type: 'string' }),
        defineField({ name: 'address', title: 'Address', type: 'text', rows: 2 }),
        defineField({ name: 'measurements', title: 'Custom size measurements', type: 'text', rows: 2 }),
        defineField({ name: 'notes', title: 'Customer notes', type: 'text', rows: 2 }),
      ],
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      group: 'details',
      readOnly: true,
      of: [
        {
          type: 'object',
          name: 'orderItem',
          fields: [
            defineField({ name: 'name', title: 'Piece', type: 'string' }),
            defineField({ name: 'size', title: 'Size', type: 'string' }),
            defineField({ name: 'qty', title: 'Quantity', type: 'number' }),
            defineField({ name: 'unitPrice', title: 'Price each', type: 'number' }),
            defineField({ name: 'lineTotal', title: 'Line total', type: 'number' }),
            defineField({ name: 'product', title: 'Product', type: 'reference', to: [{ type: 'product' }], weak: true }),
          ],
          preview: {
            select: { name: 'name', size: 'size', qty: 'qty', total: 'lineTotal' },
            prepare: ({ name, size, qty, total }) => ({ title: `${qty} × ${name}${size ? ` (${size})` : ''}`, subtitle: rs(total) }),
          },
        },
      ],
    }),
    defineField({ name: 'subtotal', title: 'Subtotal', type: 'number', group: 'details', readOnly: true }),
    defineField({ name: 'deliveryFee', title: 'Delivery', type: 'number', group: 'details', readOnly: true }),
    defineField({ name: 'total', title: 'Total to be paid', type: 'number', group: 'details', readOnly: true }),
    defineField({ name: 'paymentMethod', title: 'Payment method', type: 'string', group: 'details', readOnly: true }),
    defineField({
      name: 'attribution',
      title: 'Where the customer came from',
      type: 'object',
      group: 'details',
      readOnly: true,
      options: { collapsible: true, collapsed: true },
      fields: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'landing', 'referrer'].map((n) =>
        defineField({ name: n, title: n, type: 'string' }),
      ),
    }),
  ],
  orderings: [{ title: 'Newest first', name: 'placedDesc', by: [{ field: 'placedAt', direction: 'desc' }] }],
  preview: {
    select: { ref: 'ref', name: 'customer.name', city: 'customer.city', total: 'total', status: 'status' },
    prepare: ({ ref, name, city, total, status }) => ({
      title: `${ref || 'Order'} · ${name || ''}`,
      subtitle: `${statusTitle(status)} · ${rs(total)}${city ? ' · ' + city : ''}`,
    }),
  },
})
