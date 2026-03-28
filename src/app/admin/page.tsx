import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Package, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react'
import type { OrderStatus } from '@/types/database'
import SeedButton from '@/components/admin/SeedButton'

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

export default async function AdminDashboard() {
  const admin = createAdminClient()

  const [
    { data: revenueRows },
    { count: orderCount },
    { count: productCount },
    { count: lowStockCount },
    { data: recentOrders },
    { data: pendingOrders },
  ] = await Promise.all([
    admin.from('orders').select('total').eq('payment_status', 'paid'),
    admin.from('orders').select('*', { count: 'exact', head: true }),
    admin.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    admin.from('product_variants').select('*', { count: 'exact', head: true }).lte('stock_quantity', 5),
    admin.from('orders')
      .select('id, order_number, total, status, payment_status, created_at, shipping_address')
      .order('created_at', { ascending: false })
      .limit(10),
    admin.from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'confirmed']),
  ])

  const totalRevenue = (revenueRows ?? []).reduce((sum, r) => sum + (r.total ?? 0), 0)

  const stats = [
    {
      label: 'Total Revenue',
      value: formatPrice(totalRevenue),
      icon: TrendingUp,
      color: 'var(--green)',
      bg: 'rgba(57,255,20,0.08)',
    },
    {
      label: 'Total Orders',
      value: String(orderCount ?? 0),
      icon: ShoppingBag,
      color: 'var(--blue)',
      bg: 'rgba(0,180,216,0.08)',
      sub: `${pendingOrders?.count ?? 0} pending`,
      href: '/admin/orders',
    },
    {
      label: 'Active Products',
      value: String(productCount ?? 0),
      icon: Package,
      color: 'var(--gold)',
      bg: 'rgba(245,197,24,0.08)',
      href: '/admin/products',
    },
    {
      label: 'Low Stock',
      value: String(lowStockCount ?? 0),
      icon: AlertTriangle,
      color: 'var(--red)',
      bg: 'rgba(232,25,44,0.08)',
      sub: 'variants ≤5 units',
      href: '/admin/inventory',
    },
  ]

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="text-[28px] font-black"
            style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
          >
            Dashboard
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <SeedButton label="Seed IPL 2026" endpoint="/api/admin/seed-ipl" />
          <SeedButton label="Seed Cricket" endpoint="/api/admin/seed-cricket" />
          <SeedButton label="Seed Football" endpoint="/api/admin/seed-football" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg, sub, href }) => {
          const card = (
            <div
              className="rounded-2xl p-5"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: bg }}
                >
                  <Icon size={17} style={{ color }} />
                </div>
                {href && <ArrowRight size={13} style={{ color: 'var(--fg-sub)' }} />}
              </div>
              <p className="text-[26px] font-black leading-none mb-1" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
                {value}
              </p>
              <p className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>{label}</p>
              {sub && (
                <p className="text-[11px] mt-0.5" style={{ color, fontFamily: 'var(--font-inter)' }}>{sub}</p>
              )}
            </div>
          )
          return href ? (
            <Link key={label} href={href} className="block transition-opacity hover:opacity-85">{card}</Link>
          ) : (
            <div key={label}>{card}</div>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2
            className="text-[15px] font-bold"
            style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
          >
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-[12px] font-medium flex items-center gap-1"
            style={{ color: 'var(--red)', fontFamily: 'var(--font-inter)' }}
          >
            View all <ArrowRight size={11} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Order', 'Date', 'Amount', 'Status', 'Payment', ''].map((h) => (
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
              {(recentOrders ?? []).map((order) => (
                <tr
                  key={order.id}
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <td className="px-5 py-3">
                    <p className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
                      {order.order_number}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                      {(order.shipping_address as { full_name?: string })?.full_name ?? '—'}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
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
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
              {(recentOrders ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[13px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
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
