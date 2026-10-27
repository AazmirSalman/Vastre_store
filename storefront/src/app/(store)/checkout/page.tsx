import type { Metadata } from 'next'
import { CheckoutForm } from '@/components/CheckoutForm'

export const metadata: Metadata = { title: 'Checkout', robots: { index: false, follow: false } }

export default function CheckoutPage() {
  return (
    <div className="wrap section">
      <header className="page-head">
        <h1>Checkout</h1>
      </header>
      <CheckoutForm />
    </div>
  )
}
