import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const position = url.searchParams.get('position')

  try {
    const admin = createAdminClient()
    let query = admin
      .from('banners')
      .select('id, title, subtitle, image_url, cta_text, cta_link, position, display_order, starts_at, ends_at')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (position) query = query.eq('position', position)

    const { data, error } = await query
    if (error) return NextResponse.json({ banners: [] }, { status: 200 })

    const now = Date.now()
    const active = (data ?? []).filter((b) => {
      if (b.starts_at && new Date(b.starts_at).getTime() > now) return false
      if (b.ends_at && new Date(b.ends_at).getTime() < now) return false
      return true
    })

    return NextResponse.json(
      { banners: active },
      {
        headers: {
          'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
        },
      },
    )
  } catch {
    return NextResponse.json({ banners: [] }, { status: 200 })
  }
}
