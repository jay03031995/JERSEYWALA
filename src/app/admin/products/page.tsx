import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import ProductImportExport from '@/components/admin/ProductImportExport'

export default async function AdminProductsPage() {
  const admin = createAdminClient()
  const { data: products } = await admin
    .from('products')
    .select('id, name, slug, base_price, compare_price, is_active, is_featured, is_new_arrival, jersey_type, edition, season, variants:product_variants(stock_quantity), images:product_images(url, is_primary)')
    .order('created_at', { ascending: false })

  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1
            className="text-[28px] font-black"
            style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
          >
            Products
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
            {products?.length ?? 0} products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProductImportExport />
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-opacity hover:opacity-90"
            style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
          >
            <Plus size={14} /> Add Product
          </Link>
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Product', 'Type', 'Price', 'Stock', 'Featured', 'Status', ''].map((h) => (
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
              {(products ?? []).map((product) => {
                const primaryImg = (product.images as { url: string; is_primary: boolean }[])?.find((i) => i.is_primary)
                const totalStock = (product.variants as { stock_quantity: number }[])?.reduce(
                  (sum, v) => sum + (v.stock_quantity ?? 0), 0
                ) ?? 0
                const isLow = totalStock <= 10

                return (
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center overflow-hidden"
                          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
                        >
                          {primaryImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={primaryImg.url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-base">👕</span>
                          )}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
                            {product.name}
                          </p>
                          <p className="text-[11px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                            {product.season ?? '—'} · {product.edition}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[12px] capitalize" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                        {product.jersey_type}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[14px] font-bold" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
                        {formatPrice(product.base_price)}
                      </p>
                      {product.compare_price && (
                        <p className="text-[11px] line-through" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                          {formatPrice(product.compare_price)}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <p
                        className="text-[13px] font-medium"
                        style={{ color: isLow ? 'var(--red)' : 'var(--fg)', fontFamily: 'var(--font-inter)' }}
                      >
                        {totalStock}
                      </p>
                      {isLow && (
                        <p className="text-[10px]" style={{ color: 'var(--red)', fontFamily: 'var(--font-inter)' }}>Low stock</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {product.is_featured ? (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ background: 'rgba(245,197,24,0.12)', color: 'var(--gold)', fontFamily: 'var(--font-inter)' }}
                        >
                          Featured
                        </span>
                      ) : (
                        <span className="text-[11px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{
                          background: product.is_active ? 'rgba(57,255,20,0.1)' : 'rgba(255,255,255,0.06)',
                          color: product.is_active ? 'var(--green)' : 'var(--fg-sub)',
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-[12px] font-medium px-3 py-1 rounded-lg transition-colors"
                        style={{ color: 'var(--fg-muted)', background: 'var(--bg-raised)', border: '1px solid var(--border)', fontFamily: 'var(--font-inter)' }}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {(products ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[13px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                    No products found
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
