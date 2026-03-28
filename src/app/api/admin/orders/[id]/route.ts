import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { status, tracking_number } = body

  const update: Record<string, string> = {}
  if (status) update.status = status
  if (tracking_number !== undefined) update.tracking_number = tracking_number
  if (status === 'shipped' && tracking_number) {
    update.shipped_at = new Date().toISOString()
  }
  if (status === 'delivered') {
    update.delivered_at = new Date().toISOString()
  }

  const { error } = await admin.from('orders').update(update).eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
