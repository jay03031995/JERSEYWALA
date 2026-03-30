import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice } from '@/lib/utils'
import type { OrderStatus } from '@/types/database'
import OrdersTable from '@/components/admin/OrdersTable'

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const admin = createAdminClient()

  let query = admin
    .from('orders')
    .select('id, order_number, total, status, payment_status, created_at, shipping_address, items:order_items(id)')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(`order_number.ilike.%${q}%`)
  }

  const { data: orders } = await query

  // Filter by address fields client-side since shipping_address is JSONB
  const filtered = q
    ? (orders ?? []).filter((o) => {
        const addr = o.shipping_address as { full_name?: string; phone?: string } | null
        const lq = q.toLowerCase()
        return (
          o.order_number.toLowerCase().includes(lq) ||
          addr?.full_name?.toLowerCase().includes(lq) ||
          addr?.phone?.toLowerCase().includes(lq)
        )
      })
    : (orders ?? [])

  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1
            className="text-[28px] font-black"
            style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
          >
            Orders
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
            {filtered.length} {q ? 'results' : 'total orders'}
          </p>
        </div>
        <a
          href="/api/admin/export/orders"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium transition-opacity hover:opacity-80"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
        >
          ↓ Export CSV
        </a>
      </div>

      <OrdersTable orders={filtered} searchQuery={q ?? ''} />
    </div>
  )
}
