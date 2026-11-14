/**
 * ONE-TIME panel wording update (Nov 14): removes advance-payment wording from Site settings.
 * Runs during the site build with the host's SANITY_WRITE_TOKEN. Safe to run more than once:
 * it only changes text that still mentions advance payment. Delete this file and its line in
 * package.json after one deploy.
 */
import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const token = process.env.SANITY_WRITE_TOKEN
if (!projectId || !token) {
  console.log('[panel wording] skipped: no project or token')
  process.exit(0)
}
const client = createClient({ projectId, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production', apiVersion: '2025-02-19', token, useCdn: false })

const fix = (d) => {
  const set = {}
  if (d.announcement && /advance/i.test(d.announcement)) set.announcement = 'Made to order · Delivery across Pakistan'
  if (d.codNote && /advance|bank/i.test(d.codNote)) set.codNote = 'Every piece is made to order for you. We call to confirm every order before we begin.'
  if (d.deliveryPolicy && /advance|after payment is received/i.test(d.deliveryPolicy)) {
    set.deliveryPolicy = d.deliveryPolicy
      .replace(/\s*Payment is taken[^.]*advance[^.]*\.(\s*Send us the payment screenshot[^.]*\.)?/i, ' Our team calls to confirm every order before we start making it.')
      .replace('after payment is received', 'after your order is confirmed')
  }
  return set
}

try {
  const docs = await client.fetch('*[_id in ["siteSettings","drafts.siteSettings"]]{_id, announcement, codNote, deliveryPolicy}')
  for (const d of docs) {
    const set = fix(d)
    if (Object.keys(set).length) {
      await client.patch(d._id).set(set).commit()
      console.log(`[panel wording] updated ${d._id}: ${Object.keys(set).join(', ')}`)
    } else console.log(`[panel wording] ${d._id} already clean`)
  }
} catch (e) {
  // Never fail the site build over this.
  console.log('[panel wording] failed:', e instanceof Error ? e.message : e)
}
