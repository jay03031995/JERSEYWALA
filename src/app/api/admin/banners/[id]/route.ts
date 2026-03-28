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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await verifyAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const admin = createAdminClient()
  const { error } = await admin.from('banners').update(body).eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await verifyAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const admin = createAdminClient()
  const { error } = await admin.from('banners').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
