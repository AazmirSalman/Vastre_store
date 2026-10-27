'use client'

import { useRef, useState, type ReactNode } from 'react'

/** Product photos: swipe on phones (with dots), a grid on desktop. */
export function Gallery({ children, count }: { children: ReactNode; count: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [i, setI] = useState(0)
  return (
    <div>
      <div
        ref={ref}
        className="gal"
        onScroll={() => {
          const el = ref.current
          const f = el?.firstElementChild as HTMLElement | null
          if (!el || !f) return
          setI(Math.round(el.scrollLeft / (f.getBoundingClientRect().width + 8)))
        }}
      >
        {children}
      </div>
      {count > 1 ? (
        <div className="dots" aria-hidden="true">
          {Array.from({ length: count }, (_, k) => (
            <i key={k} className={k === i ? 'on' : undefined} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
