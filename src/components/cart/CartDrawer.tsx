'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import CartItem from './CartItem'

export default function CartDrawer() {
  const { items, isOpen, closeCart, total, itemCount } = useCartStore()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeCart])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={closeCart}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} style={{ color: 'var(--red)' }} />
            <h2
              className="text-[16px] font-bold"
              style={{ color: 'var(--fg)', fontFamily: 'var(--font-oswald)' }}
            >
              Your Cart
            </h2>
            {itemCount() > 0 && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
              >
                {itemCount()}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--fg-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-raised)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <ShoppingBag size={48} style={{ color: 'var(--fg-sub)', opacity: 0.3, marginBottom: '12px' }} />
              <p
                className="font-medium text-[14px]"
                style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
              >
                Your cart is empty
              </p>
              <p
                className="text-[13px] mt-1"
                style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
              >
                Add some jerseys to get started
              </p>
              <button
                onClick={closeCart}
                className="mt-4 text-[13px] font-medium underline"
                style={{ color: 'var(--red)', fontFamily: 'var(--font-inter)' }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => <CartItem key={item.id} item={item} />)
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="px-5 py-4 space-y-3"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-raised)' }}
          >
            <div className="flex justify-between">
              <span className="text-[13px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>Subtotal</span>
              <span className="text-[13px]" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>{formatPrice(total())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>Shipping</span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: total() >= 999 ? 'var(--green)' : 'var(--fg)', fontFamily: 'var(--font-inter)' }}
              >
                {total() >= 999 ? 'FREE' : formatPrice(99)}
              </span>
            </div>
            <div
              className="flex justify-between items-center pt-2"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <span className="text-[14px] font-bold" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>Total</span>
              <span className="text-[20px] font-bold" style={{ color: 'var(--fg)', fontFamily: 'var(--font-oswald)' }}>
                {formatPrice(total() < 999 ? total() + 99 : total())}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center py-3 rounded-xl font-semibold text-[14px] transition-opacity hover:opacity-90"
              style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={closeCart}
              className="w-full text-center text-[13px] transition-colors"
              style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
