import type { Tone } from '@/lib/types'

/** Placeholder shown wherever a photo has not been uploaded yet. Replaced automatically by the real photo. */
export function Art({ tone = 'blush', className = '' }: { tone?: Tone; className?: string }) {
  return (
    <div className={`art art--${tone} ${className}`.trim()} aria-hidden="true">
      <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" focusable="false">
        <g fill="none" stroke="currentColor" strokeWidth="1.1">
          <path d="M30 250 V112 A70 70 0 0 1 170 112 V250" />
          <path d="M46 250 V114 A54 54 0 0 1 154 114 V250" />
          <path d="M62 250 V116 A38 38 0 0 1 138 116 V250" />
        </g>
        <g fill="currentColor">
          <path d="M100 56 l5 7 -5 7 -5 -7z" />
          <path d="M100 150 l6 9 -6 9 -6 -9z" />
          <path d="M100 192 l6 9 -6 9 -6 -9z" />
          <circle cx="100" cy="127" r="3" />
        </g>
      </svg>
    </div>
  )
}
