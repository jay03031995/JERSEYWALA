import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice } from '@/lib/utils'
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

export default async function AdminOrdersPage() {
  const admin = createAdminClient()
  const { data: orders } = await admin
    .from('orders')
    .select('id, order_number, total, status, payment_status, created_at, shipping_address, items:order_items(id)')
    .order('created_at', { ascending: false })

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1
          className="text-[28px] font-black"
          style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
        >
          Orders
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
          {orders?.length ?? 0} total orders
        </p>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Order #', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Payment', ''].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em]"
                    style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).map((order) => (
                <tr
                  key={order.id}
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <td className="px-5 py-3">
                    <p className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
                      {order.order_number}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                      {(order.shipping_address as { full_name?: string; city?: string })?.full_name ?? '—'}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                      {(order.shipping_address as { city?: string })?.city ?? ''}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                      {(order.items as unknown[])?.length ?? 0}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[14px] font-bold" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
                      {formatPrice(order.total)}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium capitalize"
                      style={{
                        background: `${STATUS_COLOR[order.status as OrderStatus]}22`,
                        color: STATUS_COLOR[order.status as OrderStatus],
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium capitalize"
                      style={{
                        background: order.payment_status === 'paid' ? 'rgba(57,255,20,0.1)' : 'rgba(245,197,24,0.1)',
                        color: order.payment_status === 'paid' ? 'var(--green)' : 'var(--gold)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-[11px] font-medium"
                      style={{ color: 'var(--red)', fontFamily: 'var(--font-inter)' }}
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
              {(orders ?? []).length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[13px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
