import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ products: [] })

  const admin = createAdminClient()
  const { data } = await admin
    .from('products')
    .select('id, name, slug, base_price, images:product_images(url, is_primary)')
    .eq('is_active', true)
    .or(`name.ilike.%${q}%,player_name.ilike.%${q}%,tags.cs.{${q}}`)
    .order('is_featured', { ascending: false })
    .limit(5)

  return NextResponse.json({ products: data ?? [] })
}
