import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import ProductImportExport from '@/components/admin/ProductImportExport'
import ProductsAdminTable, { type ProductRow } from '@/components/admin/ProductsAdminTable'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const admin = createAdminClient()
  const { data } = await admin
    .from('products')
    .select(
      `id, name, slug, base_price, compare_price, is_active, is_featured, is_new_arrival,
       jersey_type, edition, season, description, meta_title, meta_description, tags, created_at,
       variants:product_variants(stock_quantity),
       images:product_images(url, is_primary)`,
    )
    .order('created_at', { ascending: false })

  const products = (data ?? []) as ProductRow[]
  const activeCount = products.filter((p) => p.is_active).length
  const featuredCount = products.filter((p) => p.is_featured).length
  const noImageCount = products.filter((p) => (p.images?.length ?? 0) === 0).length

  return (
    <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1
            className="text-[28px] font-black"
            style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
          >
            Products
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
            {products.length} total · {activeCount} active · {featuredCount} featured · {noImageCount} missing images
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

      <ProductsAdminTable products={products} />
    </div>
  )
}
