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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const admin = createAdminClient()

  const update: Record<string, unknown> = {}
  const fields = ['name', 'slug', 'description', 'player_name', 'player_number', 'season',
    'jersey_type', 'edition', 'is_active', 'is_featured', 'is_new_arrival',
    'meta_title', 'meta_description', 'tags', 'team_id']
  for (const f of fields) {
    if (f in body) update[f] = body[f] === '' ? null : body[f]
  }
  if ('base_price' in body) update.base_price = Number(body.base_price)
  if ('compare_price' in body) update.compare_price = body.compare_price ? Number(body.compare_price) : null
  if ('cost_price' in body) update.cost_price = body.cost_price ? Number(body.cost_price) : null
  update.updated_at = new Date().toISOString()

  const { error } = await admin.from('products').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Replace images if provided
  if (body.images !== undefined) {
    await admin.from('product_images').delete().eq('product_id', id)
    for (let i = 0; i < body.images.length; i++) {
      if (!body.images[i]) continue
      await admin.from('product_images').insert({
        product_id: id,
        url: body.images[i],
        alt_text: body.name || '',
        position: i,
        is_primary: i === 0,
      })
    }
  }

  // Replace variants if provided
  if (body.variants !== undefined) {
    await admin.from('product_variants').delete().eq('product_id', id)
    for (const v of body.variants) {
      if (!v.size) continue
      await admin.from('product_variants').insert({
        product_id: id,
        size: v.size,
        stock_quantity: Number(v.stock_quantity) || 0,
        sku: v.sku || `${body.slug || id}-${v.size.toLowerCase()}`,
        additional_price: Number(v.additional_price) || 0,
      })
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const admin = createAdminClient()
  await admin.from('product_images').delete().eq('product_id', id)
  await admin.from('product_variants').delete().eq('product_id', id)
  const { error } = await admin.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
