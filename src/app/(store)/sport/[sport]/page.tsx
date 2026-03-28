import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/product/ProductGrid'

interface Props {
  params: Promise<{ sport: string }>
}

const SPORT_META: Record<string, { name: string; emoji: string; desc: string }> = {
  football: { name: 'Football', emoji: '⚽', desc: 'Shop official and replica football jerseys from top clubs and national teams.' },
  cricket: { name: 'Cricket', emoji: '🏏', desc: 'Shop India and international cricket jerseys, including Test, ODI & T20 kits.' },
  ipl: { name: 'IPL', emoji: '🏆', desc: 'Shop all 10 IPL team jerseys for the 2026 season. Official & fan editions.' },
}

export default async function SportPage({ params }: Props) {
  const { sport } = await params
  const meta = SPORT_META[sport]
  if (!meta) notFound()

  const supabase = await createClient()

  // Step 1: get the sport ID
  const { data: sportRow } = await supabase
    .from('sports')
    .select('id')
    .eq('slug', sport)
    .single()

  let products: unknown[] = []

  if (sportRow) {
    // Step 2: get league IDs for this sport
    const { data: leagues } = await supabase
      .from('leagues')
      .select('id')
      .eq('sport_id', sportRow.id)

    if (leagues && leagues.length > 0) {
      const leagueIds = leagues.map((l) => l.id)

      // Step 3: get team IDs in those leagues
      const { data: teams } = await supabase
        .from('teams')
        .select('id')
        .in('league_id', leagueIds)

      if (teams && teams.length > 0) {
        const teamIds = teams.map((t) => t.id)

        // Step 4: get products for those teams
        const { data: productsData } = await supabase
          .from('products')
          .select(`*, team:teams(*, league:leagues(*)), images:product_images(*), variants:product_variants(*)`)
          .eq('is_active', true)
          .in('team_id', teamIds)
          .order('is_featured', { ascending: false })
          .limit(40)

        products = productsData ?? []
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{meta.emoji}</span>
          <h1
            className="text-[32px] font-black"
            style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
          >
            {meta.name} Jerseys
          </h1>
        </div>
        <p className="text-[14px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
          {meta.desc}
        </p>
      </div>

      <ProductGrid products={products as never[]} />
    </div>
  )
}
