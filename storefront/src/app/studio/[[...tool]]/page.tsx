import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity/config'
import { SANITY_PROJECT_ID } from '@/lib/config'

export { metadata, viewport } from 'next-sanity/studio'
export const dynamic = 'force-static'

/** The owner's editing panel, at /studio on the same website. */
export default function StudioPage() {
  if (!SANITY_PROJECT_ID) {
    return (
      <p style={{ font: '16px system-ui, sans-serif', padding: 32, maxWidth: 560 }}>
        The editing panel is not connected yet. Add NEXT_PUBLIC_SANITY_PROJECT_ID in the host&apos;s environment
        variables and redeploy.
      </p>
    )
  }
  return <NextStudio config={config} />
}
