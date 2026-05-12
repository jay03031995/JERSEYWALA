import { createClient } from '@/lib/supabase/server'

type ProductImage = { url?: string | null }

function hasUsableImage<T extends { images?: ProductImage[] | null }>(p: T): boolean {
  const imgs = p.images ?? []
  return imgs.some((i) => typeof i?.url === 'string' && i.url.trim().length > 0)
}

export async function getProducts({
  sport,
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
