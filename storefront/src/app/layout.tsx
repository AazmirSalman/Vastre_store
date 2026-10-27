import type { ReactNode } from 'react'

/** Bare page shell. The shop's header and footer live in (store)/layout.tsx; the editing panel at /studio has its own screen. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
