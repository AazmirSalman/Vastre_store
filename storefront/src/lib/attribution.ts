'use client'

/**
 * Remembers which ad brought the visitor, so every order carries it into the sheet.
 * Meta ads add utm_* values when the ad's URL parameters are set (see docs/ADS-TRACKING.md).
 */
const KEY = 'vastre.attr.v1'
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'] as const

export function captureAttribution(): void {
  try {
    const q = new URLSearchParams(window.location.search)
    const found: Record<string, string> = {}
    for (const k of PARAMS) {
      const v = q.get(k)
      if (v) found[k] = v.slice(0, 200)
    }
    if (Object.keys(found).length > 0) {
      found.landing = window.location.pathname
      localStorage.setItem(KEY, JSON.stringify(found))
    } else if (!localStorage.getItem(KEY) && document.referrer) {
      localStorage.setItem(KEY, JSON.stringify({ referrer: document.referrer.slice(0, 200), landing: window.location.pathname }))
    }
  } catch {
    /* storage unavailable: orders still work without attribution */
  }
}

export function readAttribution(): Record<string, string> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}')
    return raw && typeof raw === 'object' ? raw : {}
  } catch {
    return {}
  }
}
