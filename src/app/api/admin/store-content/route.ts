import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStoreContent, withDefaults, type StoreContent } from '@/lib/store-content'

export const dynamic = 'force-dynamic'

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

export async function GET() {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const content = await getStoreContent()
  return NextResponse.json(content)
}

export async function PUT(req: NextRequest) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let body: Partial<StoreContent>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Filter ticker messages to non-empty trimmed strings
  if (Array.isArray(body.ticker_messages)) {
    body.ticker_messages = body.ticker_messages
      .map((m) => (typeof m === 'string' ? m.trim() : ''))
      .filter(Boolean)
  }

  const merged = withDefaults(body)
  const admin = createAdminClient()
  const { error } = await admin
    .from('store_settings')
    .upsert(
      { id: 1, data: merged, updated_at: new Date().toISOString() },
      { onConflict: 'id' },
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, content: merged })
}
