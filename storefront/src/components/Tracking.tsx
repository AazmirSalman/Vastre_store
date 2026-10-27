'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { captureAttribution } from '@/lib/attribution'
import { track } from '@/lib/pixel'

/** Remembers the ad that brought the visitor, and reports page changes to the Meta Pixel. */
export function Tracking() {
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    captureAttribution()
  }, [])

  useEffect(() => {
    // The first PageView is sent by the pixel base code itself.
    if (first.current) {
      first.current = false
      return
    }
    track('PageView')
  }, [pathname])

  return null
}

/** Fires one pixel event when the page it sits on is shown. */
export function PixelEvent({ event, data }: { event: string; data?: Record<string, unknown> }) {
  useEffect(() => {
    track(event, data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event])
  return null
}
