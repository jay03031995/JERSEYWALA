import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ─── MI REAL IMAGES (from shop.mumbaiindians.com Shopify CDN) ─────────────────
const MI = {
  fanJerseyMen: 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TP0293ID__RNVL_B.jpg?v=1772786445',
  fanJerseyMenBack: 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TP0293ID__RNVL_A.jpg?v=1772786443',
  fanJerseyWomen: 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TP0294ID__RNVL_A.jpg?v=1772786523',
  fanJerseyWomenAlt: 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TP0294ID__RNVL_B.jpg?v=1772786524',
  trainingJersey: 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TS0448ID__RNVL_A.jpg?v=1772786195',
  trainingJerseyAlt: 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TS0448ID__RNVL_B.jpg?v=1772786196',
  replicaJersey: 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TP0297ID__RNVL_A.jpg?v=1772786160',
  replicaJerseyAlt: 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TP0297ID__RNVL_B.jpg?v=1772786161',
  kidsJersey: 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TP0295ID__RNVL_F.jpg?v=1772702815',
  kidsJerseyAlt: 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TP0295ID__RNVL_A.jpg?v=1772702812',
  wplJersey: 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TP0292ID-NWLB-A.jpg?v=1766993704',
}

// placehold.co images for other teams (team color backgrounds)
const ph = (bg: string, fg: string, text: string) =>
  `https://placehold.co/600x800/${bg.replace('#', '')}/${fg.replace('#', '')}?text=${encodeURIComponent(text)}`

const TEAMS_DATA = [
  { name: 'Mumbai Indians', slug: 'mumbai-indians', short_name: 'MI', primary_color: '#004BA0', secondary_color: '#F5C518', city: 'Mumbai' },
  { name: 'Chennai Super Kings', slug: 'chennai-super-kings', short_name: 'CSK', primary_color: '#FDB913', secondary_color: '#0081E3', city: 'Chennai' },
  { name: 'Royal Challengers Bengaluru', slug: 'royal-challengers-bengaluru', short_name: 'RCB', primary_color: '#D1343B', secondary_color: '#2A2A2A', city: 'Bengaluru' },
  { name: 'Kolkata Knight Riders', slug: 'kolkata-knight-riders', short_name: 'KKR', primary_color: '#2E0854', secondary_color: '#F5C518', city: 'Kolkata' },
  { name: 'Delhi Capitals', slug: 'delhi-capitals', short_name: 'DC', primary_color: '#0078BC', secondary_color: '#EF1B23', city: 'Delhi' },
  { name: 'Punjab Kings', slug: 'punjab-kings', short_name: 'PBKS', primary_color: '#ED1C2E', secondary_color: '#A7A9AC', city: 'Mohali' },
  { name: 'Rajasthan Royals', slug: 'rajasthan-royals', short_name: 'RR', primary_color: '#EA1A85', secondary_color: '#254AA5', city: 'Jaipur' },
  { name: 'Sunrisers Hyderabad', slug: 'sunrisers-hyderabad', short_name: 'SRH', primary_color: '#F26522', secondary_color: '#000000', city: 'Hyderabad' },
  { name: 'Gujarat Titans', slug: 'gujarat-titans', short_name: 'GT', primary_color: '#1B2133', secondary_color: '#0B4973', city: 'Ahmedabad' },
  { name: 'Lucknow Super Giants', slug: 'lucknow-super-giants', short_name: 'LSG', primary_color: '#005DAA', secondary_color: '#B0C7D6', city: 'Lucknow' },
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
  // ── Mumbai Indians ──
  {
    slug: 'mi-fan-jersey-men-2026',
    name: 'Mumbai Indians Official Fan Jersey 2026 – Men',
    teamSlug: 'mumbai-indians', price: 999, comparePrice: 1999,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true,
    images: [MI.fanJerseyMen, MI.fanJerseyMenBack],
  },
  {
    slug: 'mi-fan-jersey-women-2026',
    name: 'Mumbai Indians Official Fan Jersey 2026 – Women',
    teamSlug: 'mumbai-indians', price: 849, comparePrice: 1699,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true,
    images: [MI.fanJerseyWomen, MI.fanJerseyWomenAlt],
  },
  {
    slug: 'mi-training-jersey-2026',
    name: 'Mumbai Indians Official Training Jersey 2026',
    teamSlug: 'mumbai-indians', price: 999, comparePrice: 1999,
    season: '2026', jerseyType: 'training', edition: 'official',
    isFeatured: false, isNewArrival: true,
    images: [MI.trainingJersey, MI.trainingJerseyAlt],
  },
  {
    slug: 'mi-replica-jersey-2026',
    name: 'Mumbai Indians Custom Replica Jersey 2026 – Men',
    teamSlug: 'mumbai-indians', price: 2499, comparePrice: 4999,
    season: '2026', jerseyType: 'home', edition: 'replica',
    isFeatured: true, isNewArrival: true,
    images: [MI.replicaJersey, MI.replicaJerseyAlt],
  },
  {
    slug: 'mi-kids-jersey-2026',
    name: "Mumbai Indians Official Kid's Fan Jersey 2026",
    teamSlug: 'mumbai-indians', price: 799, comparePrice: 1499,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: true,
    images: [MI.kidsJersey, MI.kidsJerseyAlt],
  },
  {
    slug: 'mi-wpl-jersey-2026',
    name: 'Mumbai Indians WPL Fan Jersey 2026 – Women',
    teamSlug: 'mumbai-indians', price: 849, comparePrice: 1699,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: true,
    images: [MI.wplJersey],
  },

  // ── CSK ──
  {
    slug: 'csk-fan-jersey-2026',
    name: 'Chennai Super Kings Fan Jersey 2026',
    teamSlug: 'chennai-super-kings', price: 899, comparePrice: 1799,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true,
    images: [
      ph('#FDB913', '0081E3', 'CSK+2026'),
      ph('#0081E3', 'FDB913', 'CSK+2026+Alt'),
    ],
  },
  {
    slug: 'csk-dhoni-jersey-2026',
    name: 'CSK Dhoni Special Edition Jersey 2026',
    teamSlug: 'chennai-super-kings', price: 999, comparePrice: 2499,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true, playerName: 'DHONI',
    images: [
      ph('#FDB913', '0081E3', 'DHONI+%237'),
    ],
  },
  {
    slug: 'csk-fan-jersey-2025',
    name: 'Chennai Super Kings Fan Jersey 2025',
    teamSlug: 'chennai-super-kings', price: 699, comparePrice: 1299,
    season: '2025', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: false,
    images: [ph('#FDB913', '0081E3', 'CSK+2025')],
  },

  // ── RCB ──
  {
    slug: 'rcb-fan-jersey-2026',
    name: 'Royal Challengers Bengaluru Fan Jersey 2026',
    teamSlug: 'royal-challengers-bengaluru', price: 899, comparePrice: 1799,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true,
    images: [
      ph('#D1343B', 'FFFFFF', 'RCB+2026'),
      ph('#2A2A2A', 'D1343B', 'RCB+2026+Alt'),
    ],
  },
  {
    slug: 'rcb-kohli-jersey-2026',
    name: 'RCB Kohli Fan Edition Jersey 2026',
    teamSlug: 'royal-challengers-bengaluru', price: 999, comparePrice: 2499,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true, playerName: 'KOHLI',
    images: [ph('#D1343B', 'FFFFFF', 'KOHLI+%2318')],
  },

  // ── KKR ──
  {
    slug: 'kkr-fan-jersey-2026',
    name: 'Kolkata Knight Riders Fan Jersey 2026',
    teamSlug: 'kolkata-knight-riders', price: 899, comparePrice: 1799,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true,
    images: [
      ph('#2E0854', 'F5C518', 'KKR+2026'),
      ph('#F5C518', '2E0854', 'KKR+2026+Away'),
    ],
  },

  // ── DC ──
  {
    slug: 'dc-fan-jersey-2026',
    name: 'Delhi Capitals Fan Jersey 2026',
    teamSlug: 'delhi-capitals', price: 849, comparePrice: 1699,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: true,
    images: [
      ph('#0078BC', 'FFFFFF', 'DC+2026'),
      ph('#EF1B23', '0078BC', 'DC+2026+Alt'),
    ],
  },

  // ── PBKS ──
  {
    slug: 'pbks-fan-jersey-2026',
    name: 'Punjab Kings Fan Jersey 2026',
    teamSlug: 'punjab-kings', price: 849, comparePrice: 1699,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: true,
    images: [ph('#ED1C2E', 'FFFFFF', 'PBKS+2026')],
  },

  // ── RR ──
  {
    slug: 'rr-fan-jersey-2026',
    name: 'Rajasthan Royals Fan Jersey 2026',
    teamSlug: 'rajasthan-royals', price: 849, comparePrice: 1699,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: true,
    images: [
      ph('#EA1A85', 'FFFFFF', 'RR+2026'),
      ph('#254AA5', 'EA1A85', 'RR+2026+Away'),
    ],
  },

  // ── SRH ──
  {
    slug: 'srh-fan-jersey-2026',
    name: 'Sunrisers Hyderabad Fan Jersey 2026',
    teamSlug: 'sunrisers-hyderabad', price: 849, comparePrice: 1699,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: true,
    images: [
      ph('#F26522', '000000', 'SRH+2026'),
      ph('#000000', 'F26522', 'SRH+2026+Alt'),
    ],
  },

  // ── GT ──
  {
    slug: 'gt-fan-jersey-2026',
    name: 'Gujarat Titans Fan Jersey 2026',
    teamSlug: 'gujarat-titans', price: 849, comparePrice: 1699,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: true,
    images: [ph('#1B2133', '0B4973', 'GT+2026')],
  },

  // ── LSG ──
  {
    slug: 'lsg-fan-jersey-2026',
    name: 'Lucknow Super Giants Fan Jersey 2026',
    teamSlug: 'lucknow-super-giants', price: 849, comparePrice: 1699,
    season: '2026', jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: true,
    images: [ph('#005DAA', 'B0C7D6', 'LSG+2026')],
  },
]

export async function POST() {
  const admin = createAdminClient()
  const results: string[] = []

  try {
    // 1. Ensure cricket sport exists
    let { data: sport } = await admin.from('sports').select('id').eq('slug', 'ipl').single()
    if (!sport) {
      // Try cricket sport instead
      let { data: cricketSport } = await admin.from('sports').select('id').eq('slug', 'cricket').single()
      if (!cricketSport) {
        const { data: newSport } = await admin.from('sports').insert({
          name: 'Cricket', slug: 'cricket', type: 'cricket', display_order: 2, is_active: true,
        }).select('id').single()
        cricketSport = newSport
        results.push('Created sport: Cricket')
      }
      sport = cricketSport
    }
    if (!sport) return NextResponse.json({ error: 'Failed to create sport' }, { status: 500 })

    // 2. Ensure IPL league exists
    let { data: iplLeague } = await admin.from('leagues').select('id').eq('slug', 'ipl-2026').single()
    if (!iplLeague) {
      const { data: newLeague } = await admin.from('leagues').insert({
        sport_id: sport.id,
        name: 'IPL 2026',
        slug: 'ipl-2026',
        country: 'India',
        display_order: 1,
        is_active: true,
      }).select('id').single()
      iplLeague = newLeague
      results.push('Created league: IPL 2026')
    }
    if (!iplLeague) return NextResponse.json({ error: 'Failed to create IPL league' }, { status: 500 })

    // 3. Upsert teams
    const teamIdMap: Record<string, string> = {}
    for (const tm of TEAMS_DATA) {
      let { data: existing } = await admin.from('teams').select('id').eq('slug', tm.slug).single()
      if (!existing) {
        const { data: newTm } = await admin.from('teams').insert({
          league_id: iplLeague.id,
          name: tm.name,
          slug: tm.slug,
          short_name: tm.short_name,
          primary_color: tm.primary_color,
          secondary_color: tm.secondary_color,
          country: 'India',
          is_active: true,
        }).select('id').single()
        existing = newTm
        results.push(`Created team: ${tm.name}`)
      }
      if (existing) teamIdMap[tm.slug] = existing.id
    }

    // 4. Insert products
    let productCount = 0
    for (const p of PRODUCTS_DATA) {
      const teamId = teamIdMap[p.teamSlug]
      if (!teamId) continue

      const { data: exists } = await admin.from('products').select('id').eq('slug', p.slug).single()
      if (exists) continue

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

      if (!product) continue
      productCount++

      // Images
      for (let i = 0; i < p.images.length; i++) {
        await admin.from('product_images').insert({
          product_id: product.id,
          url: p.images[i],
          alt_text: p.name,
          position: i,
          is_primary: i === 0,
        })
      }

      // Variants (S, M, L, XL, XXL)
      for (const size of ['S', 'M', 'L', 'XL', 'XXL']) {
        await admin.from('product_variants').insert({
          product_id: product.id,
          size,
          stock_quantity: Math.floor(Math.random() * 40) + 15,
          sku: `${p.slug}-${size.toLowerCase()}`,
          additional_price: 0,
        })
      }
    }

    results.push(`Inserted ${productCount} new IPL products`)
    return NextResponse.json({ success: true, results })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
