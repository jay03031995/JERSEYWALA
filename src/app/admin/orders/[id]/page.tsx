import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice } from '@/lib/utils'
import OrderActions from '@/components/admin/OrderActions'
import type { OrderStatus } from '@/types/database'

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'var(--fg-sub)',
  confirmed: 'var(--blue)',
  processing: 'var(--blue)',
  shipped: 'var(--gold)',
  out_for_delivery: 'var(--gold)',
  delivered: 'var(--green)',
  cancelled: 'var(--red)',
  returned: 'var(--red)',
  refunded: 'var(--red)',
}

const ALL_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'processing', 'shipped',
  'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded',
]

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const admin = createAdminClient()
  const { data: order } = await admin
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', params.id)
    .single()

  if (!order) notFound()

  const addr = order.shipping_address as {
    full_name?: string; phone?: string
    address_line1?: string; address_line2?: string
    city?: string; state?: string; postal_code?: string
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="text-[26px] font-black"
            style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
          >
            {order.order_number}
          </h1>
          <p className="text-[12px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-[12px] font-medium capitalize"
            style={{
              background: `${STATUS_COLOR[order.status as OrderStatus]}22`,
              color: STATUS_COLOR[order.status as OrderStatus],
              fontFamily: 'var(--font-inter)',
            }}
          >
            {order.status.replace('_', ' ')}
          </span>
          <span
            className="px-3 py-1 rounded-full text-[12px] font-medium capitalize"
            style={{
              background: order.payment_status === 'paid' ? 'rgba(57,255,20,0.1)' : 'rgba(245,197,24,0.1)',
              color: order.payment_status === 'paid' ? 'var(--green)' : 'var(--gold)',
              fontFamily: 'var(--font-inter)',
            }}
          >
            {order.payment_status}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        {/* Left */}
        <div className="space-y-5">
          {/* Order Items */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p
              className="px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.06em]"
              style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)', borderBottom: '1px solid var(--border)' }}
            >
              Order Items
            </p>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {(order.items ?? []).map((item: {
                id: string; product_name: string; player_name?: string
                size: string; quantity: number; unit_price: number; total_price: number; image_url?: string
              }) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div
                    className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center"
                    style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
                  >
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-lg">👕</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
                      {item.product_name}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                      {item.player_name && `${item.player_name} · `}{item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-bold" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
                      {formatPrice(item.total_price)}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                      {formatPrice(item.unit_price)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="px-5 py-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex justify-between">
                <span className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>Subtotal</span>
                <span className="text-[12px]" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>Shipping</span>
                <span className="text-[12px]" style={{ color: order.shipping_cost === 0 ? 'var(--green)' : 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
                  {order.shipping_cost === 0 ? 'FREE' : formatPrice(order.shipping_cost)}
                </span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>Discount</span>
                  <span className="text-[12px]" style={{ color: 'var(--green)', fontFamily: 'var(--font-inter)' }}>−{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-[14px] font-bold" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>Total</span>
                <span className="text-[18px] font-bold" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p
              className="text-[12px] font-semibold uppercase tracking-[0.06em] mb-3"
              style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
            >
              Shipping Address
            </p>
            <p className="text-[13px] font-medium" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>{addr.full_name}</p>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>{addr.phone}</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
              {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
            </p>
            <p className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
              {addr.city}, {addr.state} – {addr.postal_code}
            </p>
          </div>

          {/* Payment Info */}
          {order.payment_reference && (
            <div
              className="rounded-2xl p-5"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <p
                className="text-[12px] font-semibold uppercase tracking-[0.06em] mb-2"
                style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
              >
                Payment Reference
              </p>
              <p className="text-[12px] font-mono" style={{ color: 'var(--fg-muted)' }}>
                {order.payment_reference}
              </p>
            </div>
          )}
        </div>

        {/* Right — Actions */}
        <OrderActions
          orderId={order.id}
          currentStatus={order.status as OrderStatus}
          currentTracking={order.tracking_number ?? ''}
          allStatuses={ALL_STATUSES}
          order={{
            id: order.id,
            order_number: order.order_number,
            created_at: order.created_at,
            status: order.status,
            payment_status: order.payment_status,
            payment_reference: order.payment_reference,
            subtotal: order.subtotal,
            shipping_cost: order.shipping_cost,
            discount_amount: order.discount_amount,
            total: order.total,
            shipping_address: addr,
            items: (order.items ?? []).map((item: {
              id: string; product_name: string; player_name?: string
              size: string; quantity: number; unit_price: number; total_price: number
            }) => item),
          }}
        />
      </div>
    </div>
  )
}
