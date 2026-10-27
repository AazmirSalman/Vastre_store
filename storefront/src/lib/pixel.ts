'use client'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

/** Sends a Meta Pixel event. Does nothing if the pixel is not installed or blocked. */
export function track(event: string, data?: Record<string, unknown>, eventID?: string): void {
  try {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
    if (eventID) window.fbq('track', event, data ?? {}, { eventID })
    else window.fbq('track', event, data ?? {})
  } catch {
    /* tracking must never break the shop */
  }
}
