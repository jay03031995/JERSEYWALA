import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

type Action =
  | 'activate'
  | 'deactivate'
  | 'feature'
  | 'unfeature'
  | 'mark_new'
  | 'unmark_new'
  | 'delete'

const ACTIONS: Action[] = [
  'activate',
  'deactivate',
  'feature',
  'unfeature',
  'mark_new',
  'unmark_new',
  'delete',
]

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) return null
  return user
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let body: { ids?: string[]; action?: Action }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const ids = Array.isArray(body.ids) ? body.ids.filter((s) => typeof s === 'string') : []
  const action = body.action
  if (!action || !ACTIONS.includes(action)) {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }
  if (ids.length === 0) {
    return NextResponse.json({ error: 'No product ids' }, { status: 400 })
  }

  const admin = createAdminClient()

  if (action === 'delete') {
    await admin.from('product_images').delete().in('product_id', ids)
    await admin.from('product_variants').delete().in('product_id', ids)
    const { error } = await admin.from('products').delete().in('id', ids)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, affected: ids.length })
  }

  const updateMap: Record<Exclude<Action, 'delete'>, Record<string, unknown>> = {
    activate: { is_active: true },
    deactivate: { is_active: false },
    feature: { is_featured: true },
    unfeature: { is_featured: false },
    mark_new: { is_new_arrival: true },
    unmark_new: { is_new_arrival: false },
  }

  const patch = { ...updateMap[action], updated_at: new Date().toISOString() }
  const { error } = await admin.from('products').update(patch).in('id', ids)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, affected: ids.length })
}
