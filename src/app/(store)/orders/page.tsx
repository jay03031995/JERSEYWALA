import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import type { OrderStatus } from '@/types/database'

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

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: ordersRaw } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  const orders = ordersRaw ?? []

  return (
    <div
      className="max-w-4xl mx-auto px-4 sm:px-6 py-10"
      style={{ minHeight: '100vh', background: 'var(--bg)' }}
    >
      <h1
        className="text-3xl font-black mb-8"
        style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
      >
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-lg font-medium" style={{ color: 'var(--fg-muted)' }}>No orders yet</p>
          <Link href="/shop" className="mt-2 inline-block text-[13px] font-medium" style={{ color: 'var(--red)' }}>
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-2xl p-5 transition-all"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-sub)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-[14px]" style={{ color: 'var(--fg)', fontFamily: 'var(--font-oswald)' }}>
                    {order.order_number}
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <Badge variant={STATUS_VARIANT[order.status as OrderStatus] ?? 'default'} className="capitalize">
                    {order.status.replace('_', ' ')}
                  </Badge>
                  <p
                    className="text-[18px] font-black"
                    style={{ color: 'var(--fg)', fontFamily: 'var(--font-oswald)' }}
                  >
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>
              <p className="text-[12px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
