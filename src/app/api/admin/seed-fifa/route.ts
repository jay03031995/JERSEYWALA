import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { FIFA_PRODUCTS, type FifaItem } from './data'

export const maxDuration = 300

const BUCKET = 'product-images'

// Teams that may need to be created (Italy, Belgium, Mexico are not in seed-football)
const EXTRA_TEAMS = [
  { name: 'Italy', slug: 'italy', short_name: 'ITA', primary_color: '#0066CC', secondary_color: '#FFFFFF', country: 'Italy' },
  { name: 'Belgium', slug: 'belgium', short_name: 'BEL', primary_color: '#ED2939', secondary_color: '#FAE042', country: 'Belgium' },
  { name: 'Mexico', slug: 'mexico', short_name: 'MEX', primary_color: '#006847', secondary_color: '#CE1126', country: 'Mexico' },
]

// Map detected team name (first 1-2 words of title) → existing team slug
const TEAM_SLUG_BY_PREFIX: Record<string, string> = {
  'Portugal': 'portugal',
  'Argentina': 'argentina',
  'Spain': 'spain',
  'Germany': 'germany',
  'Brazil': 'brazil',
  'Italy': 'italy',
  'Japan': 'japan',
  'Belgium': 'belgium',
  'England': 'england',
  'Mexico': 'mexico',
  'France': 'france',
  'Real Madrid': 'real-madrid',
  'FC Barcalona': 'fc-barcelona',
  'FC Barcelona': 'fc-barcelona',
}

function detectTeamSlug(title: string): string | null {
  // Try longer prefixes first
  const sorted = Object.keys(TEAM_SLUG_BY_PREFIX).sort((a, b) => b.length - a.length)
  for (const prefix of sorted) {
    if (title.startsWith(prefix)) return TEAM_SLUG_BY_PREFIX[prefix]
  }
  return null
}

function detectJerseyType(title: string): 'home' | 'away' | 'third' | 'training' | 'limited' {
  const t = title.toLowerCase()
  if (t.includes('special') || t.includes('anniversary') || t.includes('polo')) return 'limited'
  if (t.includes('away')) return 'away'
  if (t.includes('third')) return 'third'
  if (t.includes('training')) return 'training'
  return 'home'
}

function detectEdition(title: string): 'official' | 'fan_edition' | 'replica' {
  const t = title.toLowerCase()
  if (t.includes('player version')) return 'official'
  return 'fan_edition'
}

function detectSeason(title: string): string {
  if (title.includes('2026/27')) return '2026-27'
  if (title.includes('2025/26')) return '2025-26'
  if (title.includes('2026')) return '2026'
  return '2026'
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function extToContentType(ext: string): string {
  const e = ext.toLowerCase()
  if (e === 'jpg' || e === 'jpeg') return 'image/jpeg'
  if (e === 'png') return 'image/png'
  if (e === 'webp') return 'image/webp'
  if (e === 'gif') return 'image/gif'
  return 'application/octet-stream'
}

async function downloadAndUpload(
  admin: ReturnType<typeof createAdminClient>,
  imageUrl: string,
  destPath: string,
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl)
    if (!res.ok) return null
    const arrayBuffer = await res.arrayBuffer()
    const buf = new Uint8Array(arrayBuffer)
    const cleanUrl = imageUrl.split('?')[0]
    const ext = (cleanUrl.split('.').pop() ?? 'jpg').toLowerCase()
    const contentType = extToContentType(ext)
    const fullPath = `${destPath}.${ext}`

    const { error } = await admin.storage.from(BUCKET).upload(fullPath, buf, {
      contentType,
      upsert: true,
    })
    if (error) {
      console.error('Upload error', destPath, error.message)
      return null
    }
    const { data } = admin.storage.from(BUCKET).getPublicUrl(fullPath)
    return data.publicUrl
  } catch (e) {
    console.error('Image fetch error', imageUrl, e)
    return null
  }
}

async function ensureBucket(admin: ReturnType<typeof createAdminClient>) {
  const { data: buckets } = await admin.storage.listBuckets()
  if (buckets?.some((b) => b.name === BUCKET)) return
  await admin.storage.createBucket(BUCKET, { public: true })
}

async function ensureTeam(
  admin: ReturnType<typeof createAdminClient>,
  leagueId: string,
  team: typeof EXTRA_TEAMS[number],
): Promise<string | null> {
  const { data: existing } = await admin.from('teams').select('id').eq('slug', team.slug).single()
  if (existing) return existing.id
  const { data: created } = await admin
    .from('teams')
    .insert({
      league_id: leagueId,
      name: team.name,
      slug: team.slug,
      short_name: team.short_name,
      primary_color: team.primary_color,
      secondary_color: team.secondary_color,
      country: team.country,
      is_active: true,
    })
    .select('id')
    .single()
  return created?.id ?? null
}

async function processProduct(
  admin: ReturnType<typeof createAdminClient>,
  item: FifaItem,
): Promise<{ status: 'created' | 'skipped' | 'no_team' | 'failed'; slug: string; reason?: string }> {
  const teamSlug = detectTeamSlug(item.title)
  if (!teamSlug) return { status: 'no_team', slug: item.handle, reason: 'team not recognised' }

  const { data: team } = await admin.from('teams').select('id').eq('slug', teamSlug).single()
  if (!team) return { status: 'no_team', slug: item.handle, reason: `team ${teamSlug} missing` }

  const productSlug = item.handle
  const { data: exists } = await admin.from('products').select('id').eq('slug', productSlug).single()
  if (exists) return { status: 'skipped', slug: productSlug }

  const description = stripHtml(item.description ?? '')

  const { data: product, error: insertErr } = await admin
    .from('products')
    .insert({
      team_id: team.id,
      name: item.title,
      slug: productSlug,
      description: description.slice(0, 2000),
      base_price: item.price,
      compare_price: Math.round(item.price * 2.5),
      season: detectSeason(item.title),
      jersey_type: detectJerseyType(item.title),
      edition: detectEdition(item.title),
      is_active: true,
      is_featured: true,
      is_new_arrival: true,
      tags: ['fifa', 'world-cup-2026'],
    })
    .select('id')
    .single()

  if (!product) return { status: 'failed', slug: productSlug, reason: insertErr?.message ?? 'insert failed' }

  // Upload images
  for (let i = 0; i < item.images.length; i++) {
    const src = item.images[i]
    const destPath = `fifa-2026/${productSlug}/${i}`
    const publicUrl = await downloadAndUpload(admin, src, destPath)
    if (!publicUrl) continue
    await admin.from('product_images').insert({
      product_id: product.id,
      url: publicUrl,
      alt_text: item.title,
      position: i,
      is_primary: i === 0,
    })
  }

  // Variants (S, M, L, XL, XXL)
  const sizes = ['S', 'M', 'L', 'XL', 'XXL']
  for (const size of sizes) {
    await admin.from('product_variants').insert({
      product_id: product.id,
      size,
      stock_quantity: 20,
      sku: `${productSlug}-${size.toLowerCase()}`,
      additional_price: 0,
    })
  }

  return { status: 'created', slug: productSlug }
}

export async function POST(req: NextRequest) {
  const admin = createAdminClient()
  const url = new URL(req.url)
  const start = Math.max(0, parseInt(url.searchParams.get('start') ?? '0', 10))
  const limit = Math.min(10, Math.max(1, parseInt(url.searchParams.get('limit') ?? '5', 10)))
  const end = Math.min(FIFA_PRODUCTS.length, start + limit)

  const results: { index: number; status: string; slug: string; reason?: string }[] = []

  try {
    await ensureBucket(admin)

    // Ensure international-football league exists, then ensure extra teams
    const { data: league } = await admin
      .from('leagues')
      .select('id')
      .eq('slug', 'international-football')
      .single()
    if (league) {
      for (const team of EXTRA_TEAMS) {
        await ensureTeam(admin, league.id, team)
      }
    }

    for (let i = start; i < end; i++) {
      const result = await processProduct(admin, FIFA_PRODUCTS[i])
      results.push({ index: i, ...result })
    }

    return NextResponse.json({
      success: true,
      processed: results,
      next: end < FIFA_PRODUCTS.length ? end : null,
      total: FIFA_PRODUCTS.length,
    })
  } catch (err) {
    return NextResponse.json(
      { error: String(err), processed: results },
      { status: 500 },
    )
  }
}
