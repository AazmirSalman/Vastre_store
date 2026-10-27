export const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
export const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

/** True when no Sanity project is configured: the site runs on built-in sample products. */
export const IS_SAMPLE = !SANITY_PROJECT_ID

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
export const CURRENCY = 'PKR'
