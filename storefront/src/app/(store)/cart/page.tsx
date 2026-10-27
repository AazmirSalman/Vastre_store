import type { Metadata } from 'next'
import { CartView } from '@/components/CartView'

export const metadata: Metadata = { title: 'Your cart', robots: { index: false, follow: false } }

export default function CartPage() {
  return (
    <div className="container section">
      <header className="page-head">
        <h1>Your cart</h1>
      </header>
      <CartView />
    </div>
  )
}
