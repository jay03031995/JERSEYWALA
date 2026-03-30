import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const admin = createAdminClient()
  const { data: products } = await admin
    .from('products')
    .select('*, team:teams(name, slug), images:product_images(url, is_primary), variants:product_variants(size, stock_quantity, sku, additional_price)')
    .order('created_at', { ascending: false })

  if (!products) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })

  const headers = [
    'name', 'slug', 'description', 'base_price', 'compare_price', 'cost_price',
    'team_slug', 'season', 'jersey_type', 'edition', 'player_name', 'player_number',
    'is_active', 'is_featured', 'is_new_arrival',
    'image_1', 'image_2', 'image_3',
    'sizes', 'tags', 'meta_title', 'meta_description',
  ]

  const rows = products.map((p) => {
    const imgs = (p.images as { url: string; is_primary: boolean }[] ?? [])
      .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
    const variants = p.variants as { size: string }[] ?? []
    const sizes = variants.map((v) => v.size).join('|')

    return [
      p.name, p.slug, p.description ?? '',
      p.base_price, p.compare_price ?? '', p.cost_price ?? '',
      (p.team as { slug?: string })?.slug ?? '',
      p.season ?? '', p.jersey_type ?? '', p.edition ?? '',
      p.player_name ?? '', p.player_number ?? '',
      p.is_active, p.is_featured, p.is_new_arrival,
      imgs[0]?.url ?? '', imgs[1]?.url ?? '', imgs[2]?.url ?? '',
      sizes,
      Array.isArray(p.tags) ? p.tags.join('|') : '',
      p.meta_title ?? '', p.meta_description ?? '',
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`)
  })

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="products-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
