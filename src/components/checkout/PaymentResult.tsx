'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

type PaymentState = 'verifying' | 'paid' | 'not-paid' | 'error'

export default function PaymentResult({
  cashfreeOrderId,
  isCashOnDelivery,
}: {
  cashfreeOrderId?: string
  isCashOnDelivery: boolean
}) {
  const clearCart = useCartStore((state) => state.clearCart)
  const [state, setState] = useState<PaymentState>(
    isCashOnDelivery ? 'paid' : cashfreeOrderId ? 'verifying' : 'error',
  )
  const [message, setMessage] = useState(
    cashfreeOrderId || isCashOnDelivery
      ? ''
      : 'The payment reference is missing.',
  )

  useEffect(() => {
    if (isCashOnDelivery) {
      clearCart()
      return
    }
    if (!cashfreeOrderId) return

    let active = true
    const verify = async () => {
      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: cashfreeOrderId }),
        })
        const result = await response.json()
        if (!active) return
        if (response.ok && result.paid) {
          clearCart()
          setState('paid')
          return
        }
        setState('not-paid')
        setMessage(
          result.status === 'ACTIVE'
            ? 'Your payment is still pending. If money was deducted, refresh this page shortly.'
            : 'The payment was not completed. Your cart has been kept.',
        )
      } catch {
        if (!active) return
        setState('error')
        setMessage('We could not verify the payment. Please check My Orders before trying again.')
      }
    }

    void verify()
    return () => {
      active = false
    }
  }, [cashfreeOrderId, clearCart, isCashOnDelivery])

  const paid = state === 'paid'
  const verifying = state === 'verifying'

  return (
    <div
      className="max-w-md w-full rounded-2xl p-10 text-center"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {verifying ? (
        <Loader2
          size={52}
          className="animate-spin"
          style={{ color: 'var(--red)', margin: '0 auto 16px' }}
        />
      ) : paid ? (
        <CheckCircle
          size={56}
          style={{ color: 'var(--green)', margin: '0 auto 16px' }}
        />
      ) : (
        <XCircle
          size={56}
          style={{ color: 'var(--red)', margin: '0 auto 16px' }}
        />
      )}
      <h1
        className="text-3xl font-black mb-2"
        style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
      >
        {verifying
          ? 'Verifying Payment'
          : paid
            ? 'Order Confirmed!'
            : 'Payment Not Confirmed'}
      </h1>
      <p
        className="text-[13px] mb-6"
        style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
      >
        {verifying
          ? 'Please wait while Cashfree confirms your payment.'
          : paid
            ? 'Thank you for your purchase. Your jersey is being prepared for dispatch.'
            : message}
      </p>
      {!verifying && (
        <div className="space-y-3">
          <Link
            href="/orders"
            className="block w-full py-3 rounded-xl font-bold text-[14px] transition-opacity hover:opacity-90"
            style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
          >
            Check My Orders
          </Link>
          <Link
            href={paid ? '/shop' : '/checkout'}
            className="block w-full py-3 rounded-xl font-medium text-[14px] transition-opacity hover:opacity-80"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--fg-muted)',
              fontFamily: 'var(--font-inter)',
            }}
          >
            {paid ? 'Continue Shopping' : 'Return to Checkout'}
          </Link>
        </div>
      )}
    </div>
  )
}
