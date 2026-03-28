import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice } from '@/lib/utils'
import { Users, Mail, Phone, ShoppingBag } from 'lucide-react'

export default async function CustomersPage() {
  const admin = createAdminClient()

  const [{ data: profiles }, { data: orderStats }] = await Promise.all([
    admin.from('profiles')
      .select('id, email, full_name, phone, role, created_at')
      .eq('role', 'customer')
      .order('created_at', { ascending: false }),
    admin.from('orders')
      .select('user_id, total, status'),
  ])

  // Aggregate order data per user
  const statsByUser: Record<string, { count: number; spend: number; lastStatus: string }> = {}
  for (const o of orderStats ?? []) {
    if (!o.user_id) continue
    if (!statsByUser[o.user_id]) statsByUser[o.user_id] = { count: 0, spend: 0, lastStatus: o.status }
    statsByUser[o.user_id].count++
    statsByUser[o.user_id].spend += o.total ?? 0
    statsByUser[o.user_id].lastStatus = o.status
  }

  const customers = profiles ?? []
  const totalCustomers = customers.length
  const totalWithOrders = customers.filter((c) => statsByUser[c.id]).length
  const totalSpend = Object.values(statsByUser).reduce((s, v) => s + v.spend, 0)

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] font-black" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
          Customers
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
          All registered customers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Customers', value: String(totalCustomers), icon: Users, color: 'var(--blue)', bg: 'rgba(0,180,216,0.08)' },
          { label: 'With Orders', value: String(totalWithOrders), icon: ShoppingBag, color: 'var(--green)', bg: 'rgba(57,255,20,0.08)' },
          { label: 'Total Customer Spend', value: formatPrice(totalSpend), icon: ShoppingBag, color: 'var(--gold)', bg: 'rgba(245,197,24,0.08)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-2xl p-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
              <Icon size={17} style={{ color }} />
            </div>
            <p className="text-[26px] font-black leading-none mb-1" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
              {value}
            </p>
            <p className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-[15px] font-bold" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
            Customer List
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Customer', 'Contact', 'Orders', 'Total Spend', 'Joined', 'Last Status'].map((h) => (
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
              {customers.map((c) => {
                const stats = statsByUser[c.id]
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-5 py-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold mb-0.5 inline-flex mr-2"
                        style={{ background: 'var(--bg-raised)', color: 'var(--fg)', verticalAlign: 'middle' }}
                      >
                        {(c.full_name || c.email || '?')[0].toUpperCase()}
                      </div>
                      <span className="text-[13px] font-medium" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
                        {c.full_name || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="flex items-center gap-1 text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                        <Mail size={11} /> {c.email}
                      </p>
                      {c.phone && (
                        <p className="flex items-center gap-1 text-[11px] mt-0.5" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                          <Phone size={10} /> {c.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[14px] font-bold" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
                        {stats?.count ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-oswald)', color: stats?.spend ? 'var(--green)' : 'var(--fg-sub)' }}>
                        {stats?.spend ? formatPrice(stats.spend) : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {stats?.lastStatus ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium capitalize" style={{
                          background: 'var(--bg-raised)',
                          color: 'var(--fg-muted)',
                          fontFamily: 'var(--font-inter)',
                        }}>
                          {stats.lastStatus.replace('_', ' ')}
                        </span>
                      ) : <span className="text-[11px]" style={{ color: 'var(--fg-sub)' }}>—</span>}
                    </td>
                  </tr>
                )
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[13px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                    No customers yet
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
