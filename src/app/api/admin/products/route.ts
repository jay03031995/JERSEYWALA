import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) return null
  return user
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const admin = createAdminClient()

  const { data: product, error } = await admin.from('products').insert({
    team_id: body.team_id || null,
    name: body.name,
    slug: body.slug,
    description: body.description || null,
    player_name: body.player_name || null,
    player_number: body.player_number || null,
    season: body.season || null,
    jersey_type: body.jersey_type || 'home',
    edition: body.edition || 'fan_edition',
    base_price: Number(body.base_price) || 0,
    compare_price: body.compare_price ? Number(body.compare_price) : null,
    cost_price: body.cost_price ? Number(body.cost_price) : null,
    is_active: body.is_active ?? true,
    is_featured: body.is_featured ?? false,
    is_new_arrival: body.is_new_arrival ?? false,
    meta_title: body.meta_title || null,
    meta_description: body.meta_description || null,
    tags: body.tags || [],
  }).select('id').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Insert images
  if (body.images?.length) {
    for (let i = 0; i < body.images.length; i++) {
      await admin.from('product_images').insert({
        product_id: product.id,
        url: body.images[i],
        alt_text: body.name,
        position: i,
        is_primary: i === 0,
      })
    }
  }

  // Insert variants
  if (body.variants?.length) {
    for (const v of body.variants) {
      if (!v.size) continue
      await admin.from('product_variants').insert({
        product_id: product.id,
        size: v.size,
        stock_quantity: Number(v.stock_quantity) || 0,
        sku: v.sku || `${body.slug}-${v.size.toLowerCase()}`,
        additional_price: Number(v.additional_price) || 0,
      })
    }
  }

  return NextResponse.json({ success: true, id: product.id })
}
