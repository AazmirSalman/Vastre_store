import type { Metadata } from 'next'
import { OrderConfirmed } from '@/components/OrderConfirmed'

export const metadata: Metadata = { title: 'Order placed', robots: { index: false, follow: false } }

export default function OrderConfirmedPage() {
  return (
    <div className="container section">
      <OrderConfirmed />
    </div>
  )
}
