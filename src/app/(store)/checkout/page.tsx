'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ShieldCheck, Truck, ArrowRight, ShoppingBag, CreditCard, Banknote } from 'lucide-react'

interface AddressForm {
  full_name: string
  phone: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
}

const EMPTY: AddressForm = {
  full_name: '', phone: '', address_line1: '', address_line2: '',
  city: '', state: '', postal_code: '',
}

function Field({
  label, type = 'text', placeholder, value, onChange, required = true, half = false,
}: {
  label: string; type?: string; placeholder: string
  value: string; onChange: (v: string) => void; required?: boolean; half?: boolean
}) {
  return (
    <div style={{ gridColumn: half ? 'span 1' : 'span 2' }}>
      <label
        style={{
          display: 'block', fontSize: '11px', fontWeight: 500,
          marginBottom: '5px', color: 'var(--fg-muted)',
          fontFamily: 'var(--font-inter)', letterSpacing: '0.04em', textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '9px 13px', borderRadius: '10px',
          fontSize: '13px', background: 'var(--bg-raised)', color: 'var(--fg)',
          border: '1px solid var(--border)', fontFamily: 'var(--font-inter)', outline: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--fg-sub)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
      />
    </div>
  )
}

type PaymentMethod = 'online' | 'cod'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const router = useRouter()
  const [address, setAddress] = useState<AddressForm>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online')

  const set = (k: keyof AddressForm) => (v: string) => setAddress((a) => ({ ...a, [k]: v }))

  const subtotal = total()
  const shipping = subtotal >= 999 ? 0 : 99
  const grandTotal = subtotal + shipping

  const createOrder = async () => {
    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          name: i.name,
          playerName: i.playerName,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
          imageUrl: i.imageUrl,
        })),
        address,
        subtotal,
        shipping,
        total: grandTotal,
        paymentMethod,
      }),
    })
    const data = await orderRes.json()
    if (data.error || !data.orderId) throw new Error(data.error ?? 'Failed to create order')
    return data as { orderId: string; orderNumber: string }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) { toast.error('Your cart is empty'); return }
    setLoading(true)

    try {
      if (paymentMethod === 'cod') {
        // ── COD: just create order, go to success ──
        await createOrder()
        clearCart()
        router.push('/checkout/success?method=cod')
        return
      }

      // ── Online: Razorpay flow ──
      const { orderId } = await createOrder()

      const payRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal, orderId }),
      })
      const { razorpayOrderId, error: payErr } = await payRes.json()
      if (payErr || !razorpayOrderId) throw new Error(payErr ?? 'Payment initiation failed')

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)
      script.onload = () => {
        // @ts-expect-error Razorpay global
        new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: grandTotal * 100,
          currency: 'INR',
          name: 'The Jersey Wala',
          description: `${items.length} jersey${items.length > 1 ? 's' : ''}`,
          order_id: razorpayOrderId,
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            const v = await fetch('/api/payment/verify', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, orderId }),
            })
            const { success } = await v.json()
            if (success) { clearCart(); router.push('/checkout/success') }
            else toast.error('Payment verification failed. Contact support.')
          },
          prefill: { name: address.full_name, contact: address.phone },
          theme: { color: '#E8192C' },
          modal: { ondismiss: () => setLoading(false) },
        }).open()
      }
      script.onerror = () => {
        throw new Error('Could not load payment gateway. Check your connection.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Try again.')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
          >
            <ShoppingBag size={22} style={{ color: 'var(--fg-muted)' }} />
          </div>
          <h1 className="text-[26px] font-bold uppercase mb-1" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
            Cart is empty
          </h1>
          <p className="text-[13px] mb-5" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
            Add jerseys to your bag first.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold"
            style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
          >
            Browse Jerseys <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-start justify-center px-4 py-10"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{
          maxWidth: '900px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 0 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--red)' }}
            >
              <span className="text-white text-[10px] font-bold tracking-widest">JW</span>
            </div>
            <span className="text-[13px] font-semibold" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
              The Jersey Wala
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={12} style={{ color: 'var(--green)' }} />
            <span className="text-[11px] font-medium" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
              Secure Checkout
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_320px]">

          {/* ── LEFT: DELIVERY + PAYMENT METHOD ── */}
          <div className="px-6 py-7" style={{ borderRight: '1px solid var(--border)' }}>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-4"
              style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
            >
              Delivery Details
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name" placeholder="John Doe"
                value={address.full_name} onChange={set('full_name')} />
              <Field label="Phone" type="tel" placeholder="+91 98765 43210"
                value={address.phone} onChange={set('phone')} />
              <Field label="Address Line 1" placeholder="House No., Street"
                value={address.address_line1} onChange={set('address_line1')} />
              <Field label="Area / Landmark" placeholder="Area, Landmark"
                value={address.address_line2} onChange={set('address_line2')} required={false} />
              <Field label="City" placeholder="Mumbai"
                value={address.city} onChange={set('city')} half />
              <Field label="State" placeholder="Maharashtra"
                value={address.state} onChange={set('state')} half />
              <Field label="PIN Code" placeholder="400001"
                value={address.postal_code} onChange={set('postal_code')} half />
            </div>

            <div
              className="flex items-center gap-2 mt-5 rounded-xl px-3 py-2.5"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
            >
              <Truck size={13} style={{ color: 'var(--fg-muted)' }} />
              <p className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                {shipping === 0
                  ? 'Free delivery on this order · 5–7 business days'
                  : 'Delivery within 5–7 business days · ₹99 shipping fee'}
              </p>
            </div>

            {/* ── PAYMENT METHOD SELECTOR ── */}
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.1em] mt-7 mb-3"
              style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
            >
              Payment Method
            </p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'online', label: 'Pay Online', sub: 'UPI · Cards · Wallets', Icon: CreditCard },
                { id: 'cod',    label: 'Cash on Delivery', sub: 'Pay when order arrives', Icon: Banknote },
              ] as const).map(({ id, label, sub, Icon }) => {
                const active = paymentMethod === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className="flex items-start gap-3 px-4 py-3.5 rounded-xl text-left transition-all"
                    style={{
                      background: active ? 'rgba(232,25,44,0.08)' : 'var(--bg-raised)',
                      border: `1.5px solid ${active ? 'var(--red)' : 'var(--border)'}`,
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0"
                      style={{ borderColor: active ? 'var(--red)' : 'var(--border)' }}
                    >
                      {active && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--red)' }} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon size={12} style={{ color: active ? 'var(--red)' : 'var(--fg-muted)' }} />
                        <span className="text-[13px] font-semibold" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
                          {label}
                        </span>
                      </div>
                      <span className="text-[11px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                        {sub}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {paymentMethod === 'cod' && (
              <div
                className="flex items-start gap-2 mt-3 rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(245,197,24,0.07)', border: '1px solid rgba(245,197,24,0.2)' }}
              >
                <span className="text-[11px] leading-relaxed" style={{ color: 'var(--gold)', fontFamily: 'var(--font-inter)' }}>
                  ₹{grandTotal.toLocaleString('en-IN')} will be collected at the time of delivery. Please keep exact change ready.
                </span>
              </div>
            )}
          </div>

          {/* ── RIGHT: SUMMARY + PAY BUTTON ── */}
          <div className="px-5 py-7 flex flex-col gap-5">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
            >
              {items.length} item{items.length > 1 ? 's' : ''}
            </p>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div
                    className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0"
                    style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
                  >
                    <Image
                      src={item.imageUrl || '/placeholder-jersey.png'}
                      alt={item.name}
                      fill className="object-cover" sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium line-clamp-1 leading-snug"
                      style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
                      {item.name}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                      {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-[13px] font-semibold shrink-0"
                    style={{ color: 'var(--fg)', fontFamily: 'var(--font-oswald)' }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex justify-between">
                <span className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>Subtotal</span>
                <span className="text-[12px]" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>Shipping</span>
                <span className="text-[12px] font-semibold"
                  style={{ color: shipping === 0 ? 'var(--green)' : 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-[14px] font-bold" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>Total</span>
                <span className="text-[20px] font-bold" style={{ color: 'var(--fg)', fontFamily: 'var(--font-oswald)' }}>
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
            >
              {loading ? 'Processing…' : paymentMethod === 'cod' ? (
                <>Place Order <ArrowRight size={14} /></>
              ) : (
                <>Pay {formatPrice(grandTotal)} <ArrowRight size={14} /></>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5">
              <ShieldCheck size={11} style={{ color: 'var(--fg-sub)' }} />
              <p className="text-[11px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                {paymentMethod === 'cod'
                  ? 'COD · Pay on delivery · No advance required'
                  : 'Razorpay · UPI · Cards · Wallets'}
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
