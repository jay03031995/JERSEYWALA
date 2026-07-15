import { createAdminClient } from '@/lib/supabase/admin'

export type HomeReview = {
  id: string
  rating: number
  title: string | null
  body: string | null
  is_verified: boolean
  created_at: string
  reviewer_name: string | null
  product_name: string | null
  product_slug: string | null
}

// Approved reviews for the homepage "What Fans Say" section.
// Uses the service-role client: `reviews` public RLS exposes approved rows,
// but the `profiles` join (reviewer name) is otherwise blocked by RLS.
export async function getApprovedReviews(limit = 9): Promise<HomeReview[]> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('reviews')
      .select(`
        id, rating, title, body, is_verified, created_at,
        profile:profiles(full_name),
        product:products(name, slug)
      `)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    return (data ?? []).map((r) => {
      const profile = r.profile as { full_name?: string | null } | null
      const product = r.product as { name?: string | null; slug?: string | null } | null
      return {
        id: r.id as string,
        rating: r.rating as number,
        title: (r.title as string) ?? null,
        body: (r.body as string) ?? null,
        is_verified: (r.is_verified as boolean) ?? false,
        created_at: r.created_at as string,
        reviewer_name: profile?.full_name ?? null,
        product_name: product?.name ?? null,
        product_slug: product?.slug ?? null,
      }
    })
  } catch {
    return []
  }
}
