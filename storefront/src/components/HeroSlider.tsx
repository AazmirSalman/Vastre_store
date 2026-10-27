'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState, type CSSProperties } from 'react'

export type Slide = { src?: string; srcSet?: string; pos: string; posM: string; title: string; text?: string; cta: string; href: string }

/** The one big moment on the home page: full-width photos that fade from one to the next. */
export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = slides.length
  const go = useCallback((k: number) => setI(((k % n) + n) % n), [n])

  useEffect(() => {
    if (n < 2 || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((x) => (x + 1) % n), 6500)
    return () => clearInterval(t)
  }, [n, paused, i])

  const s = slides[i]
  return (
    <section className="hero" aria-roledescription="carousel" aria-label="Featured looks">
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
      <div className="hero__copy">
        <div className="wrap hero__row">
          <div>
            <h1>{s.title}</h1>
            {s.text ? <p>{s.text}</p> : null}
            <Link href={s.href} className="btn btn--light">
              {s.cta}
            </Link>
          </div>
          {n > 1 ? (
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
                {paused ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
                )}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
