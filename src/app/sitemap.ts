import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const SITE_URL = 'https://thejerseywala.in'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/shop?new=true`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/shop?featured=true`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  let productRoutes: MetadataRoute.Sitemap = []
  let teamRoutes: MetadataRoute.Sitemap = []
  let sportRoutes: MetadataRoute.Sitemap = []

  try {
    const admin = createAdminClient()

    const [{ data: products }, { data: teams }, { data: sports }] = await Promise.all([
      admin
        .from('products')
        .select('slug, updated_at')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(5000),
      admin.from('teams').select('slug').eq('is_active', true).limit(500),
      admin.from('sports').select('slug').eq('is_active', true).limit(50),
    ])

    productRoutes = (products ?? []).map((p) => ({
      url: `${SITE_URL}/shop/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    teamRoutes = (teams ?? []).map((t) => ({
      url: `${SITE_URL}/team/${t.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

    sportRoutes = (sports ?? []).map((s) => ({
      url: `${SITE_URL}/sport/${s.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))
  } catch (err) {
    console.error('sitemap supabase error:', err)
  }

  return [...staticRoutes, ...sportRoutes, ...teamRoutes, ...productRoutes]
}
