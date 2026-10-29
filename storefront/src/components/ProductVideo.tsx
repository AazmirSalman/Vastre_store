'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A muted, looping clip in the product gallery. Nothing downloads until the clip
 * is on screen, so shoppers who never swipe to it cost no bandwidth.
 */
export function ProductVideo({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [load, setLoad] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [still, setStill] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setStill(reduce)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoad(true)
          // The source is attached on the next render; play once it is there.
          if (!reduce) requestAnimationFrame(() => v.getAttribute('src') && v.play().catch(() => {}))
        } else {
          v.pause()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  // First time the clip comes into view: start it (or, with reduced motion, show its first frame).
  useEffect(() => {
    const v = ref.current
    if (!load || !v) return
    if (still) v.load()
    else v.play().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load])

  const toggle = () => {
    const v = ref.current
    if (!v) return
    setLoad(true)
    if (v.paused) {
      setStill(false)
      v.play().catch(() => {})
    } else {
      setStill(true)
      v.pause()
    }
  }

  return (
    <div className="pvid">
      <video
        ref={ref}
        src={load ? src : undefined}
        muted
        loop
        playsInline
        preload={load ? 'auto' : 'none'}
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button type="button" className="pvid__btn" aria-label={playing ? 'Pause video' : 'Play video'} onClick={toggle}>
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>
        )}
      </button>
    </div>
  )
}
