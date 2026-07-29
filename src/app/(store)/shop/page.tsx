import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/product/ProductGrid'
import FilterSidebar from '@/components/product/FilterSidebar'
import SkeletonCard from '@/components/ui/SkeletonCard'

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(
      `*, team:teams(*, league:leagues(*, sport:sports(*))), images:product_images(*), variants:product_variants(*)`
    )
    .eq('is_active', true)

  if (params.new === 'true') query = query.eq('is_new_arrival', true)
  if (params.featured === 'true') query = query.eq('is_featured', true)
  if (params.q) query = query.ilike('name', `%${params.q}%`)

  const { data: productsRaw } = await query
    .order('created_at', { ascending: false })
    .limit(80)
  const products = (productsRaw ?? []).filter((p) => {
    const imgs = (p.images as { url?: string | null }[] | null) ?? []
    if (!imgs.some((i) => typeof i?.url === 'string' && i.url.trim().length > 0)) return false

    const tags = ((p.tags as string[] | null) ?? []).map((tag) => tag.toLowerCase())
    const sportSlug = p.team?.league?.sport?.slug?.toLowerCase()
    const requestedSport = typeof params.sport === 'string' ? params.sport.toLowerCase() : ''
    const category = typeof params.category === 'string' ? params.category.toLowerCase() : ''

    if (requestedSport) {
      const isCricket = requestedSport === 'cricket' && (sportSlug === 'cricket' || sportSlug === 'ipl')
      if (!isCricket && sportSlug !== requestedSport && !tags.includes(requestedSport)) return false
    }
    if (category && !tags.includes(category)) {
      // Existing jerseys predate category tags, so team-linked products count as jerseys.
      if (category !== 'jersey' || !p.team_id) return false
    }
    return true
  }).slice(0, 40)

  const title = params.q
    ? `Search: "${params.q}"`
    : params.sport || params.category
    ? [params.sport, params.category].filter(Boolean).map((value) =>
        String(value).replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
      ).join(' ')
    : params.new === 'true'
    ? 'New Arrivals'
    : 'All Products'

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">

        {/* Page heading */}
        <div className="mb-8">
          <h1
            className="text-[40px] font-bold uppercase"
            style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)', letterSpacing: '-0.02em' }}
          >
            {title}
          </h1>
          <p
            className="text-[13px] mt-1"
            style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
          >
            {products.length} products found
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <Suspense fallback={null}>
            <FilterSidebar />
          </Suspense>

          <div className="flex-1 min-w-0">
            <Suspense
              fallback={
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              }
            >
              <ProductGrid products={products as never[]} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
