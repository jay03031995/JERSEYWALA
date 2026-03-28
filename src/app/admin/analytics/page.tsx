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

export default async function AnalyticsPage() {
  const admin = createAdminClient()

  const [
    { data: orders },
    { data: products },
    { data: orderItems },
  ] = await Promise.all([
    admin.from('orders').select('id, total, status, payment_status, created_at'),
    admin.from('products').select('id, name, slug, base_price, is_featured, is_active, team_id'),
    admin.from('order_items').select('product_id, product_name, quantity, total_price, order_id'),
  ])

  const allOrders = orders ?? []
  const allItems = orderItems ?? []

  // Revenue by day (last 14 days)
  const now = new Date()
  const last14: { label: string; revenue: number; orders: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    const dayOrders = allOrders.filter((o) => {
      const od = new Date(o.created_at)
      return od.getDate() === d.getDate() && od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear()
        && o.payment_status === 'paid'
    })
    last14.push({ label, revenue: dayOrders.reduce((s, o) => s + (o.total ?? 0), 0), orders: dayOrders.length })
  }
  const maxRevenue = Math.max(...last14.map((d) => d.revenue), 1)

  // Status breakdown
  const statusCounts: Partial<Record<OrderStatus, number>> = {}
  for (const o of allOrders) {
    const s = o.status as OrderStatus
    statusCounts[s] = (statusCounts[s] ?? 0) + 1
  }

  // Top products by revenue
  const productRevenue: Record<string, { name: string; revenue: number; units: number }> = {}
  for (const item of allItems) {
    const key = item.product_name
    if (!productRevenue[key]) productRevenue[key] = { name: key, revenue: 0, units: 0 }
    productRevenue[key].revenue += item.total_price ?? 0
    productRevenue[key].units += item.quantity ?? 0
  }
  const topProducts = Object.values(productRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const totalRevenue = allOrders.filter((o) => o.payment_status === 'paid').reduce((s, o) => s + (o.total ?? 0), 0)
  const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0)
  const monthRevenue = allOrders
    .filter((o) => o.payment_status === 'paid' && new Date(o.created_at) >= thisMonth)
    .reduce((s, o) => s + (o.total ?? 0), 0)
  const deliveredCount = allOrders.filter((o) => o.status === 'delivered').length
  const cancelledCount = allOrders.filter((o) => o.status === 'cancelled').length

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] font-black" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
          Analytics
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
          Sales performance overview
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: formatPrice(totalRevenue), color: 'var(--green)' },
          { label: 'This Month', value: formatPrice(monthRevenue), color: 'var(--blue)' },
          { label: 'Delivered', value: String(deliveredCount), color: 'var(--green)' },
          { label: 'Cancelled', value: String(cancelledCount), color: 'var(--red)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-[26px] font-black leading-none mb-1" style={{ fontFamily: 'var(--font-oswald)', color }}>
              {value}
            </p>
            <p className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart (last 14 days) */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-[14px] font-bold mb-6" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
          Revenue — Last 14 Days
        </h2>
        <div className="flex items-end gap-1.5" style={{ height: '120px' }}>
          {last14.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1" title={`${d.label}: ${formatPrice(d.revenue)} (${d.orders} orders)`}>
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${Math.max((d.revenue / maxRevenue) * 100, d.revenue > 0 ? 4 : 0)}px`,
                  background: d.revenue > 0 ? 'var(--green)' : 'var(--bg-raised)',
                  minHeight: d.revenue > 0 ? '4px' : '2px',
                }}
              />
              <p className="text-[9px] text-center" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                {d.label.split(' ')[0]}
              </p>
            </div>
          ))}
        </div>
        {/* X axis labels */}
        <div className="flex gap-1.5 mt-1">
          {last14.map((d) => (
            <div key={d.label} className="flex-1 text-center">
              <p className="text-[8px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                {d.label.split(' ')[1]}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order status breakdown */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-[14px] font-bold mb-5" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
            Order Status Breakdown
          </h2>
          <div className="space-y-3">
            {(Object.entries(statusCounts) as [OrderStatus, number][])
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => {
                const pct = allOrders.length ? Math.round((count / allOrders.length) * 100) : 0
                return (
                  <div key={status}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[12px] capitalize" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                        {status.replace('_', ' ')}
                      </span>
                      <span className="text-[12px] font-bold" style={{ color: STATUS_COLOR[status], fontFamily: 'var(--font-inter)' }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-raised)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: STATUS_COLOR[status] }}
                      />
                    </div>
                  </div>
                )
              })}
            {Object.keys(statusCounts).length === 0 && (
              <p className="text-[12px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>No orders yet</p>
            )}
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-[14px] font-bold mb-5" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
            Top Products by Revenue
          </h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ background: i < 3 ? 'var(--gold)' : 'var(--bg-raised)', color: i < 3 ? '#000' : 'var(--fg-sub)' }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
                    {p.name}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                    {p.units} units sold
                  </p>
                </div>
                <span className="text-[13px] font-bold shrink-0" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--green)' }}>
                  {formatPrice(p.revenue)}
                </span>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-[12px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>No sales data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
