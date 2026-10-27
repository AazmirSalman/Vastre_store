/** Turns 0300 1234567, +92 300 1234567 or 923001234567 into 923001234567. Returns '' if empty. */
export function waNumber(n?: string): string {
  const d = (n || '').replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('0')) return '92' + d.slice(1)
  return d
}

/** Returns a wa.me link with the message pre-filled, or null when no number is set. */
export function waLink(number: string | undefined, text: string): string | null {
  const n = waNumber(number)
  if (!n) return null
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`
}
