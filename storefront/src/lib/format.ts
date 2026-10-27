export function formatPKR(n: number): string {
  return 'Rs. ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** Accepts 0300 1234567, 0300-1234567, +92 300 1234567, 923001234567, 3001234567. Returns 03001234567 or null. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[\s\-().]/g, '')
  const m = digits.match(/^(?:\+?92|0)?(3\d{9})$/)
  return m ? '0' + m[1] : null
}

export function discountPercent(price: number, compareAt?: number): number | null {
  if (!compareAt || compareAt <= price) return null
  return Math.round(((compareAt - price) / compareAt) * 100)
}
