import { createAdminClient } from '@/lib/supabase/admin'

export type HomeBanner = {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  cta_text: string | null
  cta_link: string | null
}

// Active banners for a given placement (e.g. 'homepage_hero', 'instagram'),
// respecting the optional scheduling window. Service-role read mirrors the
// existing HomeBanners component so behaviour stays consistent.
export async function getBanners(position: string): Promise<HomeBanner[]> {
  try {
    const admin = createAdminClient()
    const now = new Date().toISOString()
    const { data } = await admin
      .from('banners')
      .select('id, title, subtitle, image_url, cta_text, cta_link, starts_at, ends_at')
      .eq('is_active', true)
      .eq('position', position)
      .order('display_order', { ascending: true })

    return (data ?? [])
      .filter((b) => {
        if (b.starts_at && b.starts_at > now) return false
        if (b.ends_at && b.ends_at < now) return false
        return true
      })
      .filter((b) => typeof b.image_url === 'string' && b.image_url.trim().length > 0)
      .map((b) => ({
        id: b.id as string,
        title: b.title as string,
        subtitle: (b.subtitle as string) ?? null,
        image_url: b.image_url as string,
        cta_text: (b.cta_text as string) ?? null,
        cta_link: (b.cta_link as string) ?? null,
      }))
  } catch {
    return []
  }
}
