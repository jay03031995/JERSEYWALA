import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  return profile && ['admin', 'super_admin'].includes(profile.role) ? user : null
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const admin = createAdminClient()
  const { data, error } = await admin.from('banners').insert({
    title: body.title,
    subtitle: body.subtitle || null,
    image_url: body.image_url || '',
    cta_text: body.cta_text || null,
    cta_link: body.cta_link || null,
    position: body.position || 'homepage_popup',
    display_order: body.display_order || 1,
    is_active: body.is_active ?? true,
    starts_at: body.starts_at || null,
    ends_at: body.ends_at || null,
  }).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, id: data.id })
}
