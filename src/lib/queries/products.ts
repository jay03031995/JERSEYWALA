import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Full relational select reused across homepage queries
const PRODUCT_SELECT = `
  *,
  team:teams(*, league:leagues(*, sport:sports(*))),
  images:product_images(*),
  variants:product_variants(*)
`

type ProductImage = { url?: string | null }

function hasUsableImage<T extends { images?: ProductImage[] | null }>(p: T): boolean {
  const imgs = p.images ?? []
  return imgs.some((i) => typeof i?.url === 'string' && i.url.trim().length > 0)
}

export async function getProducts({
  team,
  featured,
  newArrival,
  limit = 20,
  offset = 0,
}: {
  sport?: string
  team?: string
  featured?: boolean
  newArrival?: boolean
  limit?: number
  offset?: number
} = {}) {
  const supabase = await createClient()

  // Fetch a bit more than `limit` so the post-filter still returns enough rows
  const fetchSize = limit * 2

  let query = supabase
    .from('products')
    .select(
      `
      *,
      team:teams(
        *,
        league:leagues(*, sport:sports(*))
      ),
      images:product_images(*),
      variants:product_variants(*)
    `
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + fetchSize - 1)

  if (featured) query = query.eq('is_featured', true)
  if (newArrival) query = query.eq('is_new_arrival', true)
  if (team) query = query.eq('teams.slug', team)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).filter(hasUsableImage).slice(0, limit)
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      team:teams(*, league:leagues(*, sport:sports(*))),
      images:product_images(*),
      variants:product_variants(*)
    `
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data
}

export async function getFeaturedProducts(limit = 8) {
  return getProducts({ featured: true, limit })
}

export async function getNewArrivals(limit = 8) {
  return getProducts({ newArrival: true, limit })
}

export async function searchProducts(query: string, limit = 20) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(
      `*, team:teams(*), images:product_images(*), variants:product_variants(*)`
    )
    .eq('is_active', true)
    .or(
      `name.ilike.%${query}%,player_name.ilike.%${query}%,description.ilike.%${query}%`
    )
    .limit(limit * 2)

  if (error) throw error
  return (data ?? []).filter(hasUsableImage).slice(0, limit)
}

// Products currently on sale (compare_price higher than base_price).
// Supabase can't compare two columns in a filter, so we over-fetch rows that
// have a compare_price and narrow in JS.
export async function getSaleProducts(limit = 8) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .not('compare_price', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit * 4)
  if (error) throw error
  return (data ?? [])
    .filter(hasUsableImage)
    .filter((p) => typeof p.compare_price === 'number' && p.compare_price > p.base_price)
    .slice(0, limit)
}

// "Worn by Legends" — jerseys tied to a named player.
export async function getSignatureProducts(limit = 8) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .not('player_name', 'is', null)
    .neq('player_name', '')
    .order('created_at', { ascending: false })
    .limit(limit * 3)
  if (error) throw error
  return (data ?? []).filter(hasUsableImage).slice(0, limit)
}

// Best sellers from real order history. Aggregates order_items by product,
// then hydrates the top products. Falls back to featured products when the
// store has no (or too few) orders yet. Uses the service-role client because
// orders are not publicly readable under RLS.
export async function getBestSellers(limit = 8) {
  try {
    const admin = createAdminClient()
    const { data: items } = await admin
      .from('order_items')
      .select('product_id, quantity')

    const unitsByProduct = new Map<string, number>()
    for (const it of items ?? []) {
      if (!it.product_id) continue
      unitsByProduct.set(it.product_id, (unitsByProduct.get(it.product_id) ?? 0) + (it.quantity ?? 0))
    }

    const topIds = [...unitsByProduct.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit * 2)
      .map(([id]) => id)

    if (topIds.length === 0) return getFeaturedProducts(limit)

    const { data } = await admin
      .from('products')
      .select(PRODUCT_SELECT)
      .in('id', topIds)
      .eq('is_active', true)

    const ranked = (data ?? [])
      .filter(hasUsableImage)
      .sort((a, b) => (unitsByProduct.get(b.id) ?? 0) - (unitsByProduct.get(a.id) ?? 0))
      .slice(0, limit)

    return ranked.length > 0 ? ranked : getFeaturedProducts(limit)
  } catch {
    return getFeaturedProducts(limit)
  }
}
