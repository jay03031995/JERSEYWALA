import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 300

type ProductRow = {
  id: string
  slug: string
  name: string
  product_images: { id: string; url: string }[]
}

async function urlOk(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    if (res.ok) return true
    // Some CDNs reject HEAD; fall back to a tiny GET
    if (res.status === 405 || res.status === 403) {
      const get = await fetch(url, { method: 'GET' })
      return get.ok
    }
    return false
  } catch {
    return false
  }
}

async function analyse(slugFilter?: string) {
  const admin = createAdminClient()

  let query = admin
    .from('products')
    .select('id, slug, name, product_images(id, url)')
    .order('created_at', { ascending: false })

  if (slugFilter) query = query.like('slug', `%${slugFilter}%`)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const products = (data ?? []) as ProductRow[]
  const broken: { id: string; slug: string; name: string; reason: string; checked: number }[] = []

  for (const p of products) {
    const imgs = p.product_images ?? []
    if (imgs.length === 0) {
      broken.push({ id: p.id, slug: p.slug, name: p.name, reason: 'no_images', checked: 0 })
      continue
    }
    let workingCount = 0
    for (const img of imgs) {
      if (await urlOk(img.url)) {
        workingCount++
        break // one working image is enough to keep the product
      }
    }
    if (workingCount === 0) {
      broken.push({ id: p.id, slug: p.slug, name: p.name, reason: 'all_broken', checked: imgs.length })
    }
  }

  return { broken, total: products.length }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const slugFilter = url.searchParams.get('slug') ?? undefined
  try {
    const result = await analyse(slugFilter)
    return NextResponse.json({
      mode: 'dry-run',
      total_scanned: result.total,
      broken_count: result.broken.length,
      broken: result.broken,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const slugFilter = url.searchParams.get('slug') ?? undefined
  const confirm = url.searchParams.get('confirm')
  if (confirm !== 'yes') {
    return NextResponse.json(
      { error: 'Refusing to delete without ?confirm=yes' },
      { status: 400 },
    )
  }

  const admin = createAdminClient()
  try {
    const { broken, total } = await analyse(slugFilter)
    const deleted: string[] = []
    const failed: { slug: string; error: string }[] = []

    for (const p of broken) {
      await admin.from('product_images').delete().eq('product_id', p.id)
      await admin.from('product_variants').delete().eq('product_id', p.id)
      const { error } = await admin.from('products').delete().eq('id', p.id)
      if (error) failed.push({ slug: p.slug, error: error.message })
      else deleted.push(p.slug)
    }

    return NextResponse.json({
      mode: 'delete',
      total_scanned: total,
      deleted_count: deleted.length,
      deleted,
      failed,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
