import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function CheckoutSuccessPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="max-w-md w-full rounded-2xl p-10 text-center"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <CheckCircle size={56} style={{ color: 'var(--green)', margin: '0 auto 16px' }} />
        <h1
          className="text-3xl font-black mb-2"
          style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
        >
          Order Confirmed!
        </h1>
        <p className="text-[13px] mb-6" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
          Thank you for your purchase. Your jersey is being prepared for dispatch.
          You&apos;ll receive a confirmation shortly.
        </p>
        <div className="space-y-3">
          <Link
            href="/orders"
            className="block w-full py-3 rounded-xl font-bold text-[14px] transition-opacity hover:opacity-90"
            style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
          >
            Track Your Order
          </Link>
          <Link
            href="/shop"
            className="block w-full py-3 rounded-xl font-medium text-[14px] transition-opacity hover:opacity-80"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--fg-muted)',
              fontFamily: 'var(--font-inter)',
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
