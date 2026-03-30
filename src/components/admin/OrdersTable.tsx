'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
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

interface Order {
  id: string
  order_number: string
  total: number
  status: string
  payment_status: string
  created_at: string
  shipping_address: unknown
  items: unknown[]
}

export default function OrdersTable({ orders, searchQuery }: { orders: Order[]; searchQuery: string }) {
  const router = useRouter()
  const [q, setQ] = useState(searchQuery)
  const [, startTransition] = useTransition()

  const handleSearch = (val: string) => {
    setQ(val)
    startTransition(() => {
      const params = new URLSearchParams()
      if (val.trim()) params.set('q', val.trim())
      router.push(`/admin/orders${params.toString() ? `?${params}` : ''}`)
    })
  }

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--fg-muted)' }} />
        <input
          type="text"
          value={q}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by order #, name or phone…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--fg)',
            fontFamily: 'var(--font-inter)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--fg-sub)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
        />
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {orders.map((order) => {
          const addr = order.shipping_address as { full_name?: string; phone?: string; city?: string; state?: string; address_line1?: string; postal_code?: string } | null
          return (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="block rounded-2xl p-4"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-[14px] font-bold" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
                  {order.order_number}
                </p>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium capitalize"
                  style={{
                    background: `${STATUS_COLOR[order.status as OrderStatus]}22`,
                    color: STATUS_COLOR[order.status as OrderStatus],
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-[13px] font-medium" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
                {addr?.full_name ?? '—'}
              </p>
              <p className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                {addr?.phone ?? ''} · {addr?.city ?? ''}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                {addr?.address_line1 ?? ''}{addr?.city ? `, ${addr.city}` : ''}{addr?.postal_code ? ` – ${addr.postal_code}` : ''}
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[15px] font-bold" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
                  {formatPrice(order.total)}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </Link>
          )
        })}
        {orders.length === 0 && (
          <p className="text-center py-12 text-[13px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
            No orders found
          </p>
        )}
      </div>

      {/* Desktop table */}
      <div
        className="hidden sm:block rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Order #', 'Customer', 'Phone', 'Address', 'Date', 'Items', 'Total', 'Status', 'Payment', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] whitespace-nowrap"
                    style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const addr = order.shipping_address as {
                  full_name?: string; phone?: string
                  address_line1?: string; address_line2?: string
                  city?: string; state?: string; postal_code?: string
                } | null
                const fullAddress = [addr?.address_line1, addr?.address_line2, addr?.city, addr?.state, addr?.postal_code]
                  .filter(Boolean).join(', ')
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-bold whitespace-nowrap" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
                        {order.order_number}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[12px] font-medium whitespace-nowrap" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
                        {addr?.full_name ?? '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[12px] whitespace-nowrap" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                        {addr?.phone ?? '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="text-[11px] truncate" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }} title={fullAddress}>
                        {fullAddress || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[12px] whitespace-nowrap" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                        {(order.items as unknown[])?.length ?? 0}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[14px] font-bold whitespace-nowrap" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
                        {formatPrice(order.total)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-[11px] font-medium capitalize whitespace-nowrap"
                        style={{
                          background: `${STATUS_COLOR[order.status as OrderStatus]}22`,
                          color: STATUS_COLOR[order.status as OrderStatus],
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-[11px] font-medium capitalize whitespace-nowrap"
                        style={{
                          background: order.payment_status === 'paid' ? 'rgba(57,255,20,0.1)' : order.payment_status === 'cod' ? 'rgba(0,180,216,0.1)' : 'rgba(245,197,24,0.1)',
                          color: order.payment_status === 'paid' ? 'var(--green)' : order.payment_status === 'cod' ? 'var(--blue)' : 'var(--gold)',
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[11px] font-medium whitespace-nowrap"
                        style={{ color: 'var(--red)', fontFamily: 'var(--font-inter)' }}
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-[13px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
