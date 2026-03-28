import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { CheckCircle, Package, Truck } from 'lucide-react'
import type { OrderStatus } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

const TRACKING_STEPS = [
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
]

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered']

const STATUS_VARIANT: Record<OrderStatus, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  pending: 'default',
  confirmed: 'info',
  processing: 'info',
  shipped: 'warning',
  out_for_delivery: 'warning',
  delivered: 'success',
  cancelled: 'danger',
  returned: 'danger',
  refunded: 'danger',
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: order } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order) notFound()

  const currentStep = STATUS_ORDER.indexOf(order.status)
  const addr = order.shipping_address as {
    full_name?: string; phone?: string
    address_line1?: string; address_line2?: string
    city?: string; state?: string; postal_code?: string
  }

  return (
    <div
      className="max-w-4xl mx-auto px-4 sm:px-6 py-10"
      style={{ minHeight: '100vh', background: 'var(--bg)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="text-[28px] font-black"
            style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
          >
            {order.order_number}
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[order.status as OrderStatus] ?? 'default'} className="capitalize">
          {order.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Tracking */}
      <div
        className="rounded-2xl p-6 mb-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h2
          className="font-bold text-[14px] mb-5"
          style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
        >
          Order Tracking
        </h2>
        <div className="flex items-center">
          {TRACKING_STEPS.map((step, i) => {
            const stepIndex = STATUS_ORDER.indexOf(step.key)
            const done = currentStep >= stepIndex
            const Icon = step.icon
            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: done ? 'var(--red)' : 'var(--bg-raised)',
                      border: done ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    <Icon size={15} style={{ color: done ? '#fff' : 'var(--fg-sub)' }} />
                  </div>
                  <p
                    className="text-[11px] mt-1.5 text-center"
                    style={{
                      color: done ? 'var(--fg)' : 'var(--fg-sub)',
                      fontFamily: 'var(--font-inter)',
                      fontWeight: done ? 600 : 400,
                      maxWidth: '60px',
                    }}
                  >
                    {step.label}
                  </p>
                </div>
                {i < TRACKING_STEPS.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-1 mb-5"
                    style={{
                      background: currentStep > stepIndex ? 'var(--red)' : 'var(--border)',
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
        {order.tracking_number && (
          <p className="text-[12px] mt-5" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
            Tracking #:{' '}
            <span className="font-mono font-semibold" style={{ color: 'var(--fg)' }}>
              {order.tracking_number}
            </span>
            {order.tracking_url && (
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noopener"
                className="ml-2 underline"
                style={{ color: 'var(--red)' }}
              >
                Track package →
              </a>
            )}
          </p>
        )}
      </div>

      {/* Items */}
      <div
        className="rounded-2xl p-6 mb-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h2
          className="font-bold text-[14px] mb-4"
          style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
        >
          Order Items
        </h2>
        <div className="space-y-4">
          {order.items?.map((item: {
            id: string; product_name: string; player_name?: string
            size: string; quantity: number; unit_price: number; total_price: number
          }) => (
            <div key={item.id} className="flex justify-between items-start">
              <div>
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}
                >
                  {item.product_name}
                </p>
                {item.player_name && (
                  <p className="text-[11px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                    {item.player_name}
                  </p>
                )}
                <p className="text-[11px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                  Size: {item.size} · Qty: {item.quantity}
                </p>
              </div>
              <p
                className="text-[14px] font-bold"
                style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
              >
                {formatPrice(item.total_price)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex justify-between text-[12px]">
            <span style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>Subtotal</span>
            <span style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>Shipping</span>
            <span
              style={{
                color: order.shipping_cost === 0 ? 'var(--green)' : 'var(--fg)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              {order.shipping_cost === 0 ? 'FREE' : formatPrice(order.shipping_cost)}
            </span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-[12px]">
              <span style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>Discount</span>
              <span style={{ color: 'var(--green)', fontFamily: 'var(--font-inter)' }}>
                −{formatPrice(order.discount_amount)}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <span
              className="text-[14px] font-bold"
              style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}
            >
              Total
            </span>
            <span
              className="text-[20px] font-black"
              style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
            >
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Address */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h2
          className="font-bold text-[14px] mb-3"
          style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
        >
          Delivery Address
        </h2>
        <p className="text-[13px] font-semibold" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
          {addr.full_name}
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
          {addr.phone}
        </p>
        <p className="text-[12px] mt-1.5" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
          {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
        </p>
        <p className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
          {addr.city}, {addr.state} – {addr.postal_code}
        </p>
      </div>
    </div>
  )
}
