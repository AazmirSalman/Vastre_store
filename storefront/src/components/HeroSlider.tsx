'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'

export type Slide = { src?: string; srcSet?: string; pos: string; posM: string; title: string; text?: string; cta: string; href: string }
export type HeroVideo = { phone?: string; wide?: string }

const PauseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
)
const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>
)

/**
 * The one big moment on the home page. With a video from the panel it plays a silent loop
 * (over the first slide's photo, which shows while the video loads); otherwise full-width
 * photos fade from one to the next.
 */
export function HeroSlider({ slides: all, video }: { slides: Slide[]; video?: HeroVideo }) {
  const hasVideo = Boolean(video?.phone || video?.wide)
  const slides = hasVideo ? all.slice(0, 1) : all
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [src, setSrc] = useState<string>()
  const [ready, setReady] = useState(false)
  const vid = useRef<HTMLVideoElement>(null)
  const n = slides.length
  const go = useCallback((k: number) => setI(((k % n) + n) % n), [n])

  useEffect(() => {
    if (n < 2 || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((x) => (x + 1) % n), 6500)
    return () => clearInterval(t)
  }, [n, paused, i])

  // Pick the clip for this screen once, on the client. Reduced motion: leave it paused.
  useEffect(() => {
    if (!hasVideo) return
    const wide = window.matchMedia('(min-width: 900px)').matches
    setSrc(wide ? video?.wide || video?.phone : video?.phone || video?.wide)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPaused(true)
  }, [hasVideo, video?.phone, video?.wide])

  useEffect(() => {
    const v = vid.current
    if (!v || !src) return
    if (paused) v.pause()
    else v.play().catch(() => {})
  }, [paused, src])

  const s = slides[i]
  return (
    <section className="hero" aria-roledescription={hasVideo ? undefined : 'carousel'} aria-label="Featured looks">
      {slides.map((sl, k) => (
        <div key={k} className={`slide${k === i ? ' on' : ''}`} aria-hidden={k !== i}>
          {sl.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sl.src}
              srcSet={sl.srcSet}
              sizes="100vw"
              alt=""
              style={{ '--pd': sl.pos, '--pm': sl.posM } as CSSProperties}
              loading={k === 0 ? 'eager' : 'lazy'}
              fetchPriority={k === 0 ? 'high' : undefined}
            />
          ) : (
            <div className="slide__blank" />
          )}
        </div>
      ))}
      {src ? (
        <video
          ref={vid}
          className={`hero__video${ready ? ' on' : ''}`}
          src={src}
          muted
          loop
          playsInline
          autoPlay={!paused}
          preload="auto"
          aria-hidden="true"
          onPlaying={() => setReady(true)}
        />
      ) : null}
      <div className="hero__copy">
        <div className="wrap hero__row">
          <div>
            <h1>{s.title}</h1>
            {s.text ? <p>{s.text}</p> : null}
            <Link href={s.href} className="btn btn--light">
              {s.cta}
            </Link>
          </div>
          {hasVideo ? (
            <div className="hero__ctl">
              <button type="button" aria-label={paused ? 'Play video' : 'Pause video'} onClick={() => setPaused((p) => !p)}>
                {paused ? <PlayIcon /> : <PauseIcon />}
              </button>
            </div>
          ) : n > 1 ? (
            <div className="hero__ctl">
              <button type="button" aria-label="Previous look" onClick={() => go(i - 1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <span>
                {i + 1} / {n}
              </span>
              <button type="button" aria-label="Next look" onClick={() => go(i + 1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
              </button>
              <button type="button" aria-label={paused ? 'Play slideshow' : 'Pause slideshow'} onClick={() => setPaused((p) => !p)}>
                {paused ? <PlayIcon /> : <PauseIcon />}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
