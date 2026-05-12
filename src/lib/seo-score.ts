export type SeoInput = {
  name: string | null
  slug: string | null
  description: string | null
  meta_title?: string | null
  meta_description?: string | null
  base_price: number | null
  compare_price: number | null
  season: string | null
  player_name: string | null
  tags?: string[] | null
  imageCount: number
  variantCount: number
  isActive: boolean
}

export type SeoBreakdown = {
  total: number
  label: 'excellent' | 'good' | 'fair' | 'poor'
  signals: { key: string; ok: boolean; points: number; reason: string }[]
}

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}/i

export function computeSeoScore(p: SeoInput): SeoBreakdown {
  const signals: SeoBreakdown['signals'] = []

  const nameLen = (p.name ?? '').length
  signals.push({
    key: 'name',
    ok: nameLen >= 25 && nameLen <= 70,
    points: 10,
    reason: nameLen < 25 ? 'Name too short' : nameLen > 70 ? 'Name too long' : 'Name length OK',
  })

  const slug = p.slug ?? ''
  signals.push({
    key: 'slug',
    ok: slug.length >= 12 && !UUID_RE.test(slug),
    points: 10,
    reason: !slug ? 'No slug' : UUID_RE.test(slug) ? 'Slug looks like a UUID' : 'Slug looks descriptive',
  })

  const desc = p.description ?? ''
  signals.push({
    key: 'description-50',
    ok: desc.length >= 50,
    points: 10,
    reason: desc.length >= 50 ? 'Has description' : 'Add a description (50+ chars)',
  })
  signals.push({
    key: 'description-150',
    ok: desc.length >= 150,
    points: 10,
    reason: desc.length >= 150 ? 'Description is detailed' : 'Description could be longer (150+ chars)',
  })

  signals.push({
    key: 'images-1',
    ok: p.imageCount >= 1,
    points: 10,
    reason: p.imageCount >= 1 ? 'Has at least one image' : 'Missing images',
  })
  signals.push({
    key: 'images-3',
    ok: p.imageCount >= 3,
    points: 10,
    reason: p.imageCount >= 3 ? 'Multiple angles shown' : 'Add 3+ images for Google Shopping',
  })

  signals.push({
    key: 'variants',
    ok: p.variantCount >= 1,
    points: 10,
    reason: p.variantCount >= 1 ? 'Has size variants' : 'Add size variants',
  })

  signals.push({
    key: 'season',
    ok: !!p.season,
    points: 5,
    reason: p.season ? 'Season set' : 'Set a season (helps freshness signals)',
  })

  signals.push({
    key: 'price',
    ok: !!p.base_price && p.base_price > 0,
    points: 5,
    reason: p.base_price ? 'Price set' : 'Set a price',
  })

  signals.push({
    key: 'discount',
    ok: !!p.compare_price && (p.compare_price ?? 0) > (p.base_price ?? 0),
    points: 5,
    reason: p.compare_price && p.compare_price > (p.base_price ?? 0) ? 'Shows a discount' : 'Add a compare-at price to show savings',
  })

  signals.push({
    key: 'meta_title',
    ok: !!p.meta_title && p.meta_title.length >= 30,
    points: 5,
    reason: p.meta_title && p.meta_title.length >= 30 ? 'SEO title set' : 'Add an SEO title (30+ chars)',
  })

  signals.push({
    key: 'meta_description',
    ok: !!p.meta_description && p.meta_description.length >= 80,
    points: 5,
    reason: p.meta_description && p.meta_description.length >= 80 ? 'Meta description set' : 'Add a meta description (80+ chars)',
  })

  signals.push({
    key: 'active',
    ok: p.isActive,
    points: 5,
    reason: p.isActive ? 'Visible on storefront' : 'Activate to be indexable',
  })

  const total = signals.reduce((sum, s) => sum + (s.ok ? s.points : 0), 0)
  const label: SeoBreakdown['label'] =
    total >= 85 ? 'excellent' : total >= 65 ? 'good' : total >= 45 ? 'fair' : 'poor'

  return { total, label, signals }
}
