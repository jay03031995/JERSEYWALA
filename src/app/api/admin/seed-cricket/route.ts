import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Local catalogue artwork remains reliable when third-party image hosts block
// hotlinking. Four distinct variants avoid repeating one generic fallback.
const INDIA_BLUE = '/images/cricket/india-blue-cricket-jersey.jpg'
const INDIA_BLUE_ALT = '/images/cricket/india-blue-cricket-jersey.jpg'
const INDIA_WHITE = '/images/cricket/test-white-cricket-jersey.jpg'
const INDIA_WC = '/images/cricket/india-blue-cricket-jersey.jpg'

const AUSTRALIA_GOLD = '/images/cricket/australia-gold-cricket-jersey.jpg'
const AUSTRALIA_ALT = '/images/cricket/australia-gold-cricket-jersey.jpg'

const ENGLAND_BLUE = '/images/cricket/india-blue-cricket-jersey.jpg'
const ENGLAND_RED = '/images/cricket/india-blue-cricket-jersey.jpg'

const PAKISTAN_GREEN = '/images/cricket/green-cricket-jersey.jpg'
const PAKISTAN_ALT = '/images/cricket/green-cricket-jersey.jpg'

const SA_GREEN = '/images/cricket/green-cricket-jersey.jpg'
const NZ_BLACK = '/images/cricket/green-cricket-jersey.jpg'
const WI_MAROON = '/images/cricket/green-cricket-jersey.jpg'
const SRI_BLUE = '/images/cricket/india-blue-cricket-jersey.jpg'
const BANG_GREEN = '/images/cricket/green-cricket-jersey.jpg'

const TEAMS_DATA = [
  { name: 'India', slug: 'india-cricket', short_name: 'IND', primary_color: '#003580', secondary_color: '#FF671F', country: 'India' },
  { name: 'Australia', slug: 'australia-cricket', short_name: 'AUS', primary_color: '#FFCD00', secondary_color: '#00843D', country: 'Australia' },
  { name: 'England', slug: 'england-cricket', short_name: 'ENG', primary_color: '#003078', secondary_color: '#CF081F', country: 'England' },
  { name: 'Pakistan', slug: 'pakistan-cricket', short_name: 'PAK', primary_color: '#01411C', secondary_color: '#FFFFFF', country: 'Pakistan' },
  { name: 'South Africa', slug: 'south-africa-cricket', short_name: 'SA', primary_color: '#007A4D', secondary_color: '#FFB81C', country: 'South Africa' },
  { name: 'New Zealand', slug: 'new-zealand-cricket', short_name: 'NZ', primary_color: '#000000', secondary_color: '#FFFFFF', country: 'New Zealand' },
  { name: 'West Indies', slug: 'west-indies-cricket', short_name: 'WI', primary_color: '#7B1C3E', secondary_color: '#FFD700', country: 'West Indies' },
  { name: 'Sri Lanka', slug: 'sri-lanka-cricket', short_name: 'SL', primary_color: '#003785', secondary_color: '#FFD700', country: 'Sri Lanka' },
  { name: 'Bangladesh', slug: 'bangladesh-cricket', short_name: 'BAN', primary_color: '#006A4E', secondary_color: '#F42A41', country: 'Bangladesh' },
]

const PRODUCTS_DATA: {
  slug: string
  name: string
  teamSlug: string
  price: number
  comparePrice: number
  season: string
  jerseyType: 'home' | 'away' | 'third' | 'training' | 'limited'
  edition: 'official' | 'fan_edition' | 'replica'
  isFeatured: boolean
  isNewArrival: boolean
  playerName?: string
  images: string[]
}[] = [
  // ── India ──
  {
    slug: 'india-t20-jersey-2026',
    name: 'India T20 Official Fan Jersey 2026',
    teamSlug: 'india-cricket', price: 999, comparePrice: 2499,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true,
    images: [INDIA_BLUE, INDIA_BLUE_ALT],
  },
  {
    slug: 'india-wc-jersey-2026',
    name: 'India World Cup Jersey 2026',
    teamSlug: 'india-cricket', price: 1125, comparePrice: 4999,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true,
    images: [INDIA_WC, INDIA_BLUE],
  },
  {
    slug: 'india-kohli-jersey-2026',
    name: 'India Virat Kohli Fan Jersey 2026',
    teamSlug: 'india-cricket', price: 999, comparePrice: 2499,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true, playerName: 'KOHLI',
    images: [INDIA_BLUE],
  },
  {
    slug: 'india-rohit-jersey-2026',
    name: 'India Rohit Sharma Fan Jersey 2026',
    teamSlug: 'india-cricket', price: 999, comparePrice: 2499,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: true, playerName: 'ROHIT',
    images: [INDIA_BLUE],
  },
  {
    slug: 'india-bumrah-jersey-2026',
    name: 'India Bumrah Fan Jersey 2026',
    teamSlug: 'india-cricket', price: 999, comparePrice: 2499,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: true, playerName: 'BUMRAH',
    images: [INDIA_BLUE],
  },
  {
    slug: 'india-test-jersey-whites',
    name: 'India Test Cricket Jersey – Whites',
    teamSlug: 'india-cricket', price: 799, comparePrice: 1499,
    season: '2026', jerseyType: 'away', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [INDIA_WHITE],
  },
  {
    slug: 'india-t20-jersey-2025',
    name: 'India T20 Fan Jersey 2025',
    teamSlug: 'india-cricket', price: 699, comparePrice: 1299,
    season: '2025', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [INDIA_BLUE],
  },

  // ── Australia ──
  {
    slug: 'australia-odi-jersey-2026',
    name: 'Australia ODI Fan Jersey 2026',
    teamSlug: 'australia-cricket', price: 899, comparePrice: 1999,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true,
    images: [AUSTRALIA_GOLD, AUSTRALIA_ALT],
  },
  {
    slug: 'australia-t20-jersey-2026',
    name: 'Australia T20 Fan Jersey 2026',
    teamSlug: 'australia-cricket', price: 899, comparePrice: 1999,
    season: '2026', jerseyType: 'third', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [AUSTRALIA_ALT],
  },

  // ── England ──
  {
    slug: 'england-t20-jersey-2026',
    name: 'England T20 Fan Jersey 2026',
    teamSlug: 'england-cricket', price: 899, comparePrice: 1999,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: true,
    images: [ENGLAND_BLUE, ENGLAND_RED],
  },

  // ── Pakistan ──
  {
    slug: 'pakistan-t20-jersey-2026',
    name: 'Pakistan T20 Fan Jersey 2026',
    teamSlug: 'pakistan-cricket', price: 899, comparePrice: 1999,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true,
    images: [PAKISTAN_GREEN, PAKISTAN_ALT],
  },

  // ── South Africa ──
  {
    slug: 'south-africa-t20-jersey-2026',
    name: 'South Africa T20 Fan Jersey 2026',
    teamSlug: 'south-africa-cricket', price: 849, comparePrice: 1699,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: true,
    images: [SA_GREEN],
  },

  // ── New Zealand ──
  {
    slug: 'new-zealand-t20-jersey-2026',
    name: 'New Zealand T20 Fan Jersey 2026',
    teamSlug: 'new-zealand-cricket', price: 849, comparePrice: 1699,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [NZ_BLACK],
  },

  // ── West Indies ──
  {
    slug: 'west-indies-t20-jersey-2026',
    name: 'West Indies T20 Fan Jersey 2026',
    teamSlug: 'west-indies-cricket', price: 849, comparePrice: 1699,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [WI_MAROON],
  },

  // ── Sri Lanka ──
  {
    slug: 'sri-lanka-t20-jersey-2026',
    name: 'Sri Lanka T20 Fan Jersey 2026',
    teamSlug: 'sri-lanka-cricket', price: 849, comparePrice: 1699,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [SRI_BLUE],
  },

  // ── Bangladesh ──
  {
    slug: 'bangladesh-t20-jersey-2026',
    name: 'Bangladesh T20 Fan Jersey 2026',
    teamSlug: 'bangladesh-cricket', price: 849, comparePrice: 1699,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [BANG_GREEN],
  },
]

export async function POST() {
  const admin = createAdminClient()
  const results: string[] = []

  try {
    // 1. Ensure cricket sport exists
    let { data: sport } = await admin.from('sports').select('id').eq('slug', 'cricket').single()
    if (!sport) {
      const { data: newSport } = await admin.from('sports').insert({
        name: 'Cricket', slug: 'cricket', type: 'cricket', display_order: 2, is_active: true,
      }).select('id').single()
      sport = newSport
      results.push('Created sport: Cricket')
    }
    if (!sport) return NextResponse.json({ error: 'Failed to create sport' }, { status: 500 })

    // 2. Ensure international cricket league exists
    let { data: league } = await admin.from('leagues').select('id').eq('slug', 'international-cricket').single()
    if (!league) {
      const { data: newLeague } = await admin.from('leagues').insert({
        sport_id: sport.id,
        name: 'International Cricket',
        slug: 'international-cricket',
        country: 'World',
        display_order: 1,
        is_active: true,
      }).select('id').single()
      league = newLeague
      results.push('Created league: International Cricket')
    }
    if (!league) return NextResponse.json({ error: 'Failed to create league' }, { status: 500 })

    // 3. Upsert teams
    const teamIdMap: Record<string, string> = {}
    for (const tm of TEAMS_DATA) {
      let { data: existing } = await admin.from('teams').select('id').eq('slug', tm.slug).single()
      if (!existing) {
        const { data: newTm } = await admin.from('teams').insert({
          league_id: league.id,
          name: tm.name,
          slug: tm.slug,
          short_name: tm.short_name,
          primary_color: tm.primary_color,
          secondary_color: tm.secondary_color,
          country: tm.country,
          is_active: true,
        }).select('id').single()
        existing = newTm
        results.push(`Created team: ${tm.name}`)
      }
      if (existing) teamIdMap[tm.slug] = existing.id
    }

    // 4. Insert only missing products. Existing catalogue images are managed
    // in the admin and must never be replaced by seed data.
    let productCount = 0
    for (const p of PRODUCTS_DATA) {
      const teamId = teamIdMap[p.teamSlug]
      if (!teamId) continue

      const { data: existing } = await admin
        .from('products')
        .select('id')
        .eq('slug', p.slug)
        .maybeSingle()

      if (existing) continue

      let productId: string | undefined
      if (!productId) {
        const { data: product } = await admin.from('products').insert({
          team_id: teamId,
          name: p.name,
          slug: p.slug,
          base_price: p.price,
          compare_price: p.comparePrice,
          season: p.season,
          jersey_type: p.jerseyType,
          edition: p.edition,
          player_name: p.playerName ?? null,
          is_active: true,
          is_featured: p.isFeatured,
          is_new_arrival: p.isNewArrival,
        }).select('id').single()

        productId = product?.id
        if (!productId) continue
        productCount++

        for (const size of ['S', 'M', 'L', 'XL', 'XXL']) {
          await admin.from('product_variants').insert({
            product_id: productId,
            size,
            stock_quantity: Math.floor(Math.random() * 40) + 15,
            sku: `${p.slug}-${size.toLowerCase()}`,
            additional_price: 0,
          })
        }
      }

      if (!existing) {
        const uniqueImages = [...new Set(p.images)]
        await admin.from('product_images').insert(
          uniqueImages.map((url, index) => ({
            product_id: productId,
            url,
            alt_text: p.name,
            position: index,
            is_primary: index === 0,
          })),
        )
      }
    }

    results.push(`Inserted ${productCount} new cricket products`)
    return NextResponse.json({ success: true, results })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
