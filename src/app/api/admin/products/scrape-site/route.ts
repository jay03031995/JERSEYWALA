import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

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

type ShopifyVariant = {
  price?: string
  compare_at_price?: string | null
  option1?: string | null
  title?: string
  sku?: string | null
}

type ShopifyImage = { src: string }

type ShopifyProduct = {
  id: number
  title: string
  handle: string
  body_html?: string
  vendor?: string
  product_type?: string
  tags?: string | string[]
  images?: ShopifyImage[]
  variants?: ShopifyVariant[]
  published_at?: string
}

type NormProduct = {
  source_id: string
  name: string
  slug: string
  description: string
  price: number | null
  comparePrice: number | null
  vendor: string | null
  productType: string | null
  tags: string[]
  images: string[]
  sizes: string[]
  variants: { size: string; price: number; sku: string | null }[]
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

function normalizeShopify(p: ShopifyProduct, origin: string): NormProduct {
  const firstVariant = p.variants?.[0]
  const price = firstVariant?.price ? Number(firstVariant.price) : null
  const compareAt = firstVariant?.compare_at_price
    ? Number(firstVariant.compare_at_price)
    : null

  const sizes = unique(
    (p.variants ?? [])
      .map((v) => v.option1 ?? v.title ?? '')
      .map((s) => (s ?? '').trim())
      .filter(Boolean),
  )

  const variants = (p.variants ?? [])
    .filter((v) => (v.option1 ?? v.title))
    .map((v) => ({
      size: (v.option1 ?? v.title ?? '').trim(),
      price: v.price ? Number(v.price) : (price ?? 0),
      sku: v.sku ?? null,
    }))

  const tags = Array.isArray(p.tags)
    ? p.tags
    : typeof p.tags === 'string'
      ? p.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : []

  return {
    source_id: `shopify-${origin}-${p.id}`,
    name: p.title ?? '',
    slug: slugify(p.handle ?? p.title ?? ''),
    description: stripHtml(p.body_html ?? ''),
    price,
    comparePrice: compareAt,
    vendor: p.vendor ?? null,
    productType: p.product_type ?? null,
    tags,
    images: (p.images ?? []).map((i) => i.src).filter(Boolean),
    sizes,
    variants,
  }
}

async function listShopify(originUrl: URL, collectionHandle?: string): Promise<ShopifyProduct[] | null> {
  const base = collectionHandle
    ? `${originUrl.origin}/collections/${collectionHandle}/products.json`
    : `${originUrl.origin}/products.json`

  const out: ShopifyProduct[] = []
  for (let page = 1; page <= 20; page++) {
    try {
      const res = await fetch(`${base}?limit=250&page=${page}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      if (!res.ok) return out.length > 0 ? out : null
      const data = (await res.json()) as { products?: ShopifyProduct[] }
      const products = data.products ?? []
      if (products.length === 0) break
      out.push(...products)
      if (products.length < 250) break
    } catch {
      return out.length > 0 ? out : null
    }
  }
  return out
}

async function importProduct(
  admin: ReturnType<typeof createAdminClient>,
  np: NormProduct,
): Promise<'created' | 'skipped' | 'failed'> {
  const { data: exists } = await admin
    .from('products')
    .select('id')
    .eq('slug', np.slug)
    .single()
  if (exists) return 'skipped'

  if (!np.name || !np.price || (np.images?.length ?? 0) === 0) return 'failed'

  const { data: product, error } = await admin
    .from('products')
    .insert({
      name: np.name,
      slug: np.slug,
      description: np.description?.slice(0, 4000) || null,
      base_price: np.price,
      compare_price: np.comparePrice,
      jersey_type: 'home',
      edition: 'fan_edition',
      is_active: true,
      is_featured: false,
      is_new_arrival: true,
      tags: np.tags,
    })
    .select('id')
    .single()

  if (error || !product) return 'failed'

  for (let i = 0; i < np.images.length; i++) {
    await admin.from('product_images').insert({
      product_id: product.id,
      url: np.images[i],
      alt_text: np.name,
      position: i,
      is_primary: i === 0,
    })
  }

  const variantList = np.variants.length > 0
    ? np.variants
    : (np.sizes.length > 0 ? np.sizes : ['S', 'M', 'L', 'XL', 'XXL']).map((s) => ({
        size: s,
        price: np.price ?? 0,
        sku: null,
      }))

  for (const v of variantList) {
    await admin.from('product_variants').insert({
      product_id: product.id,
      size: v.size.toUpperCase(),
      stock_quantity: 20,
      sku: v.sku ?? `${np.slug}-${v.size.toLowerCase()}`,
      additional_price: 0,
    })
  }

  return 'created'
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let body: {
    url?: string
    mode?: 'preview' | 'import'
    start?: number
    limit?: number
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.url) return NextResponse.json({ error: 'url is required' }, { status: 400 })
  let url: URL
  try {
    url = new URL(body.url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  // Collection handle from /collections/<handle>
  const colMatch = url.pathname.match(/\/collections\/([^\/?#]+)/)
  const collectionHandle = colMatch?.[1]

  const shopifyProducts = await listShopify(url, collectionHandle)
  if (!shopifyProducts || shopifyProducts.length === 0) {
    return NextResponse.json(
      {
        error:
          'No products found. Site does not expose a Shopify products.json feed. Use the single-URL importer for individual products.',
      },
      { status: 404 },
    )
  }

  const normalized = shopifyProducts.map((p) => normalizeShopify(p, url.origin))

  if (body.mode !== 'import') {
    return NextResponse.json({
      success: true,
      mode: 'preview',
      total: normalized.length,
      sample: normalized.slice(0, 5),
    })
  }

  // Import in batches
  const start = Math.max(0, body.start ?? 0)
  const limit = Math.min(20, Math.max(1, body.limit ?? 10))
  const end = Math.min(normalized.length, start + limit)
  const slice = normalized.slice(start, end)

  const admin = createAdminClient()
  const results: { slug: string; status: string }[] = []
  for (const np of slice) {
    const status = await importProduct(admin, np)
    results.push({ slug: np.slug, status })
  }

  revalidatePath('/')
  revalidatePath('/shop')
  revalidatePath('/sitemap.xml')

  return NextResponse.json({
    success: true,
    mode: 'import',
    total: normalized.length,
    processed: results,
    next: end < normalized.length ? end : null,
  })
}
