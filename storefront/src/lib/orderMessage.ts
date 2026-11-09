import { formatPKR } from './format'
import type { Quote } from './types'

export type OrderCustomer = { name: string; phone: string; city: string; address: string }

/** The text that opens pre-filled in WhatsApp. `ref` is empty when the order was not saved online. */
/** `payment` is true when the customer is sending us their payment screenshot. */
export function orderMessage(opts: { ref?: string; quote: Quote; customer?: Partial<OrderCustomer>; payment?: boolean }): string {
  const { ref, quote, customer, payment } = opts
  const items = quote.lines
    .filter((l) => l.ok)
    .map((l) => `${l.qty} x ${l.name}${l.size ? ` (size ${l.size})` : ''} - ${formatPKR(l.lineTotal)}`)
  const out = [
    ref ? (payment ? `Assalam o Alaikum! Payment screenshot for my order ${ref} is attached.` : `Assalam o Alaikum! My order ${ref}`) : 'Assalam o Alaikum! I would like to order:',
    '',
    ...items,
    '',
    `Delivery: ${quote.deliveryFee > 0 ? formatPKR(quote.deliveryFee) : 'Free'}`,
    `Total (paid in advance by bank transfer): ${formatPKR(quote.total)}`,
  ]
  if (customer?.name || customer?.phone || customer?.address) {
    out.push('')
    if (customer.name) out.push(`Name: ${customer.name}`)
    if (customer.phone) out.push(`Phone: ${customer.phone}`)
    if (customer.address) out.push(`Address: ${customer.address}${customer.city ? ', ' + customer.city : ''}`)
  }
  return out.join('\n')
}
