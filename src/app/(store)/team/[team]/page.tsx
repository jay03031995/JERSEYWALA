import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/product/ProductGrid'

interface Props {
  params: Promise<{ team: string }>
}

export default async function TeamPage({ params }: Props) {
  const { team: teamSlug } = await params
  const supabase = await createClient()

  const { data: team } = await supabase
    .from('teams')
    .select('*, league:leagues(*, sport:sports(*))')
    .eq('slug', teamSlug)
    .single()

  if (!team) notFound()

  const { data: productsRaw } = await supabase
    .from('products')
    .select(`*, team:teams(*), images:product_images(*), variants:product_variants(*)`)
    .eq('is_active', true)
    .eq('team_id', team.id)
    .order('created_at', { ascending: false })
  const products = productsRaw ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Team header */}
      <div
        className="rounded-2xl p-8 mb-8 text-white"
        style={{ background: `linear-gradient(135deg, ${team.primary_color ?? '#1d4ed8'}, ${team.secondary_color ?? '#1e40af'})` }}
      >
        <h1 className="text-3xl font-black">{team.name}</h1>
        {team.short_name && (
          <p className="text-white/70 mt-1">{team.short_name} · {team.country}</p>
        )}
        <p className="text-white/60 text-sm mt-2">
          {(team.league as { name: string })?.name}
        </p>
      </div>

      <div className="mb-6">
        <h2
          className="text-[20px] font-bold"
          style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
        >
          {products.length > 0
            ? `${products.length} Jersey${products.length > 1 ? 's' : ''} Available`
            : 'No jerseys found yet — check back soon!'}
        </h2>
      </div>

      <ProductGrid products={products as never[]} />
    </div>
  )
}
