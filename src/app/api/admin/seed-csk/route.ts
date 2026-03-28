import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// CSK brand colors: Yellow #FDB913, Blue #0081E3
const ph = (bg: string, fg: string, text: string) =>
  `https://placehold.co/600x800/${bg.replace('#', '')}/${fg.replace('#', '')}?text=${encodeURIComponent(text)}`

const Y = '#FDB913'  // CSK yellow
const B = '#0081E3'  // CSK blue
const W = '#FFFFFF'

const CSK_PRODUCTS: {
  slug: string
  name: string
  description: string
  price: number
  comparePrice: number
  jerseyType: 'home' | 'away' | 'training' | 'limited'
  edition: 'official' | 'fan_edition' | 'replica'
  playerName?: string
  isFeatured: boolean
  isNewArrival: boolean
  images: string[]
  sizes: string[]
}[] = [
  {
    slug: 'csk-fan-jersey-men-2026',
    name: 'CSK Official Fan Jersey 2026 – Men',
    description: 'Official Chennai Super Kings fan jersey for IPL 2026. Lightweight moisture-wicking fabric. Classic yellow with blue accents.',
    price: 999, comparePrice: 1999,
    jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true,
    images: [ph(Y, B, 'CSK+Fan+Jersey\n2026+Men'), ph(B, Y, 'CSK+2026\nBack')],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'csk-fan-jersey-women-2026',
    name: 'CSK Official Fan Jersey 2026 – Women',
    description: "Official CSK women's fan jersey for IPL 2026. Slim fit with breathable mesh panels.",
    price: 999, comparePrice: 1999,
    jerseyType: 'home', edition: 'fan_edition',
    isFeatured: true, isNewArrival: true,
    images: [ph(Y, B, 'CSK+Women\n2026'), ph(B, Y, 'CSK+Women\nBack')],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    slug: 'csk-kids-fan-jersey-2026',
    name: "CSK Official Kid's Fan Jersey 2026",
    description: 'Official CSK kids jersey for IPL 2026. Same design as the pros, sized for young fans.',
    price: 799, comparePrice: 1499,
    jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: true,
    images: [ph(Y, B, 'CSK+Kids\n2026')],
    sizes: ['4Y', '6Y', '8Y', '10Y', '12Y'],
  },
  {
    slug: 'csk-training-jersey-2026',
    name: 'CSK Official Training Jersey 2026',
    description: 'CSK training jersey worn by players in practice sessions. Ultra-light performance fabric.',
    price: 1299, comparePrice: 2499,
    jerseyType: 'training', edition: 'official',
    isFeatured: false, isNewArrival: true,
    images: [ph(B, Y, 'CSK+Training\n2026'), ph(Y, B, 'CSK+Training\nBack')],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'csk-away-jersey-2026',
    name: 'CSK Away Jersey 2026',
    description: 'CSK 2026 away kit in navy blue. Alternate jersey worn in select IPL 2026 fixtures.',
    price: 999, comparePrice: 1999,
    jerseyType: 'away', edition: 'fan_edition',
    isFeatured: false, isNewArrival: true,
    images: [ph(B, Y, 'CSK+Away\n2026'), ph(Y, B, 'CSK+Away\nBack')],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'csk-dhoni-jersey-2026',
    name: 'CSK MSD Dhoni #7 Fan Jersey 2026',
    description: 'Official CSK fan jersey with MS Dhoni name and number 7. Limited edition for the legend.',
    price: 1299, comparePrice: 2499,
    jerseyType: 'home', edition: 'fan_edition',
    playerName: 'DHONI', isFeatured: true, isNewArrival: true,
    images: [ph(Y, B, 'DHONI+%237\nCSK+2026'), ph(B, Y, 'MSD\nBack')],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'csk-ruturaj-jersey-2026',
    name: 'CSK Ruturaj Gaikwad #31 Fan Jersey 2026',
    description: 'Official CSK fan jersey with Ruturaj Gaikwad name and captain number.',
    price: 1199, comparePrice: 2299,
    jerseyType: 'home', edition: 'fan_edition',
    playerName: 'GAIKWAD', isFeatured: true, isNewArrival: true,
    images: [ph(Y, B, 'GAIKWAD+%2331\nCSK+2026')],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'csk-jadeja-jersey-2026',
    name: 'CSK Ravindra Jadeja #8 Fan Jersey 2026',
    description: 'Official CSK fan jersey with Ravindra Jadeja name and number.',
    price: 1199, comparePrice: 2299,
    jerseyType: 'home', edition: 'fan_edition',
    playerName: 'JADEJA', isFeatured: false, isNewArrival: true,
    images: [ph(Y, B, 'JADEJA+%238\nCSK+2026')],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'csk-replica-jersey-2026',
    name: 'CSK Pro Replica Jersey 2026 – Men',
    description: 'Player-grade replica jersey identical to what the CSK squad wears on the field. Authentic cut and fabric.',
    price: 2999, comparePrice: 5999,
    jerseyType: 'home', edition: 'replica',
    isFeatured: true, isNewArrival: true,
    images: [ph(Y, B, 'CSK+Pro\nReplica+2026'), ph(B, Y, 'CSK+Replica\nBack')],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'csk-official-match-jersey-2026',
    name: 'CSK Official Match Jersey 2026 – On-Field',
    description: 'The exact jersey worn by Chennai Super Kings players during IPL 2026 matches. Official BCCI-approved player edition.',
    price: 5999, comparePrice: 8999,
    jerseyType: 'home', edition: 'official',
    isFeatured: true, isNewArrival: true,
    images: [ph(Y, B, 'CSK+Official\nMatch+2026'), ph(B, Y, 'Player\nEdition')],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'csk-jersey-combo-2026',
    name: 'CSK Jersey + Cap Combo 2026',
    description: 'CSK fan jersey bundled with the official CSK yellow cap. Perfect fan combo for match days.',
    price: 1499, comparePrice: 2799,
    jerseyType: 'home', edition: 'fan_edition',
    isFeatured: false, isNewArrival: true,
    images: [ph(Y, B, 'CSK+Combo\nJersey+Cap')],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'csk-limited-edition-jersey-2026',
    name: 'CSK Limited Edition Autograph Jersey 2026',
    description: 'Exclusively designed IPL 2026 limited edition jersey with squad autograph print. Only 500 units.',
    price: 3999, comparePrice: 6999,
    jerseyType: 'limited', edition: 'official',
    isFeatured: true, isNewArrival: true,
    images: [ph(Y, B, 'CSK+Limited\nEdition+2026'), ph(W, B, 'Autograph\nPrint')],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
]

export async function POST() {
  const admin = createAdminClient()
  const results: string[] = []

  try {
    // 1. Ensure sport exists
    let { data: sport } = await admin.from('sports').select('id').eq('slug', 'ipl').single()
    if (!sport) {
      const { data: cricket } = await admin.from('sports').select('id').eq('slug', 'cricket').single()
      if (!cricket) {
        const { data: ns } = await admin.from('sports').insert({
          name: 'Cricket', slug: 'cricket', type: 'cricket', display_order: 2, is_active: true,
        }).select('id').single()
        sport = ns
        results.push('Created sport: Cricket')
      } else {
        sport = cricket
      }
    }
    if (!sport) return NextResponse.json({ error: 'Failed to get sport' }, { status: 500 })

    // 2. Ensure IPL 2026 league exists
    let { data: league } = await admin.from('leagues').select('id').eq('slug', 'ipl-2026').single()
    if (!league) {
      const { data: nl } = await admin.from('leagues').insert({
        sport_id: sport.id, name: 'IPL 2026', slug: 'ipl-2026',
        country: 'India', display_order: 1, is_active: true,
      }).select('id').single()
      league = nl
      results.push('Created league: IPL 2026')
    }
    if (!league) return NextResponse.json({ error: 'Failed to get league' }, { status: 500 })

    // 3. Ensure CSK team exists
    let { data: team } = await admin.from('teams').select('id').eq('slug', 'chennai-super-kings').single()
    if (!team) {
      const { data: nt } = await admin.from('teams').insert({
        league_id: league.id,
        name: 'Chennai Super Kings',
        slug: 'chennai-super-kings',
        short_name: 'CSK',
        primary_color: '#FDB913',
        secondary_color: '#0081E3',
        country: 'India',
        is_active: true,
      }).select('id').single()
      team = nt
      results.push('Created team: CSK')
    }
    if (!team) return NextResponse.json({ error: 'Failed to get CSK team' }, { status: 500 })

    // 4. Insert products
    let count = 0
    for (const p of CSK_PRODUCTS) {
      // Skip if already exists
      const { data: exists } = await admin.from('products').select('id').eq('slug', p.slug).single()
      if (exists) {
        results.push(`Skipped (exists): ${p.slug}`)
        continue
      }

      const { data: product } = await admin.from('products').insert({
        team_id: team.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        base_price: p.price,
        compare_price: p.comparePrice,
        season: '2026',
        jersey_type: p.jerseyType,
        edition: p.edition,
        player_name: p.playerName ?? null,
        is_active: true,
        is_featured: p.isFeatured,
        is_new_arrival: p.isNewArrival,
      }).select('id').single()

      if (!product) continue
      count++

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

      // Variants
      for (const size of p.sizes) {
        await admin.from('product_variants').insert({
          product_id: product.id,
          size,
          stock_quantity: Math.floor(Math.random() * 50) + 10,
          sku: `${p.slug}-${size.toLowerCase()}`,
          additional_price: 0,
        })
      }
    }

    results.push(`✓ Inserted ${count} new CSK 2026 jersey products`)
    return NextResponse.json({ success: true, results })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
