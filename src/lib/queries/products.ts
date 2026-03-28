import { createClient } from '@/lib/supabase/server'

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
    .range(offset, offset + limit - 1)

  if (featured) query = query.eq('is_featured', true)
  if (newArrival) query = query.eq('is_new_arrival', true)
  if (team) query = query.eq('teams.slug', team)

  const { data, error } = await query
  if (error) throw error
  return data
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
    .limit(limit)

  if (error) throw error
  return data
}
