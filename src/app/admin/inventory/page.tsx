import { createAdminClient } from '@/lib/supabase/admin'
import StockAdjuster from '@/components/admin/StockAdjuster'

export default async function AdminInventoryPage() {
  const admin = createAdminClient()
  const { data: variants } = await admin
    .from('product_variants')
    .select('id, size, stock_quantity, sku, product:products(id, name, slug)')
    .order('stock_quantity', { ascending: true })

  const lowCount = (variants ?? []).filter((v) => v.stock_quantity <= 5).length
  const outCount = (variants ?? []).filter((v) => v.stock_quantity === 0).length

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1
          className="text-[28px] font-black"
          style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
        >
          Inventory
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
          {variants?.length ?? 0} variants ·{' '}
          <span style={{ color: 'var(--red)' }}>{outCount} out of stock</span> ·{' '}
          <span style={{ color: 'var(--gold)' }}>{lowCount} low stock</span>
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
                {['Product', 'Size', 'SKU', 'Stock', 'Adjust'].map((h) => (
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
              {(variants ?? []).map((variant) => {
                const product = (Array.isArray(variant.product) ? variant.product[0] : variant.product) as { id: string; name: string; slug: string } | null
                const isOut = variant.stock_quantity === 0
                const isLow = variant.stock_quantity > 0 && variant.stock_quantity <= 5

                return (
                  <tr key={variant.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-5 py-3">
                      <p className="text-[13px] font-medium" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
                        {product?.name ?? '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-bold"
                        style={{ background: 'var(--bg-raised)', color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
                      >
                        {variant.size}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[11px] font-mono" style={{ color: 'var(--fg-sub)' }}>
                        {variant.sku ?? '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p
                        className="text-[15px] font-bold"
                        style={{
                          fontFamily: 'var(--font-oswald)',
                          color: isOut ? 'var(--red)' : isLow ? 'var(--gold)' : 'var(--green)',
                        }}
                      >
                        {variant.stock_quantity}
                      </p>
                      {isOut && <p className="text-[10px]" style={{ color: 'var(--red)', fontFamily: 'var(--font-inter)' }}>Out of stock</p>}
                      {isLow && <p className="text-[10px]" style={{ color: 'var(--gold)', fontFamily: 'var(--font-inter)' }}>Low stock</p>}
                    </td>
                    <td className="px-5 py-3">
                      <StockAdjuster variantId={variant.id} current={variant.stock_quantity} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
