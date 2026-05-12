import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

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

type ScrapedProduct = {
  source: 'shopify' | 'jsonld' | 'opengraph' | 'unknown'
  name: string
  description: string
  price: number | null
  comparePrice: number | null
  currency: string | null
  images: string[]
  sizes: string[]
  vendor: string | null
  tags: string[]
  slug: string
  sourceUrl: string
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

async function tryShopify(url: URL): Promise<ScrapedProduct | null> {
  // Shopify product URL pattern: /products/<handle>
  const match = url.pathname.match(/\/products\/([^\/?#]+)/)
  if (!match) return null
  const handle = match[1]
  const jsonUrl = `${url.origin}/products/${handle}.json`

  try {
    const res = await fetch(jsonUrl, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    const product = data.product
    if (!product) return null

    const firstVariant = product.variants?.[0]
    const price = firstVariant?.price ? Number(firstVariant.price) : null
    const compareAt = firstVariant?.compare_at_price
      ? Number(firstVariant.compare_at_price)
      : null

    const sizes = unique(
      (product.variants ?? [])
        .map((v: { option1?: string; title?: string }) => v.option1 ?? v.title)
        .filter(Boolean),
    ) as string[]

    return {
      source: 'shopify',
      name: product.title ?? '',
      description: stripHtml(product.body_html ?? ''),
      price,
      comparePrice: compareAt,
      currency: 'INR',
      images: (product.images ?? []).map((i: { src: string }) => i.src),
      sizes,
      vendor: product.vendor ?? null,
      tags: Array.isArray(product.tags)
        ? product.tags
        : typeof product.tags === 'string'
          ? product.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : [],
      slug: slugify(product.handle ?? product.title ?? handle),
      sourceUrl: url.toString(),
    }
  } catch {
    return null
  }
}

function extractJsonLdProducts(html: string): unknown[] {
  const results: unknown[] = []
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim())
      const arr = Array.isArray(parsed) ? parsed : [parsed]
      for (const obj of arr) {
        if (obj && (obj['@type'] === 'Product' || obj['@type']?.includes?.('Product'))) {
          results.push(obj)
        }
        if (obj && Array.isArray(obj['@graph'])) {
          for (const g of obj['@graph']) {
            if (g['@type'] === 'Product') results.push(g)
          }
        }
      }
    } catch {
      // skip malformed blob
    }
  }
  return results
}

function pickJsonLdProduct(items: unknown[], html: string, url: URL): ScrapedProduct | null {
  const p = items[0] as Record<string, unknown> | undefined
  if (!p) return null

  const name = (p.name as string) ?? ''
  if (!name) return null

  const offer =
    (p.offers as Record<string, unknown> | undefined) ??
    (Array.isArray(p.offers) ? (p.offers as Record<string, unknown>[])[0] : undefined)
  const price = offer?.price ? Number(offer.price) : null
  const currency = (offer?.priceCurrency as string) ?? null
  const description = stripHtml(((p.description as string) ?? extractOgDescription(html) ?? '') as string)
  const imageRaw = p.image
  const images = Array.isArray(imageRaw)
    ? (imageRaw as string[])
    : imageRaw
      ? [imageRaw as string]
      : []
  const brand =
    typeof p.brand === 'string'
      ? p.brand
      : ((p.brand as Record<string, unknown>)?.name as string) ?? null

  return {
    source: 'jsonld',
    name,
    description,
    price,
    comparePrice: null,
    currency,
    images: unique(images.filter(Boolean)),
    sizes: [],
    vendor: brand,
    tags: [],
    slug: slugify(name),
    sourceUrl: url.toString(),
  }
}

function meta(html: string, selector: RegExp): string | null {
  const m = html.match(selector)
  if (!m) return null
  return m[1].trim()
}

function extractOgDescription(html: string): string | null {
  return meta(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
}

function tryOpenGraph(html: string, url: URL): ScrapedProduct | null {
  const title =
    meta(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ??
    meta(html, /<title[^>]*>([^<]+)<\/title>/i)
  if (!title) return null

  const description =
    meta(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ??
    meta(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ??
    ''

  const imageMatches = html.matchAll(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
  )
  const images = unique([...imageMatches].map((m) => m[1]).filter(Boolean))

  const priceAmount = meta(html, /<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i)
  const currency = meta(html, /<meta[^>]+property=["']product:price:currency["'][^>]+content=["']([^"']+)["']/i)

  return {
    source: 'opengraph',
    name: title,
    description,
    price: priceAmount ? Number(priceAmount) : null,
    comparePrice: null,
    currency: currency ?? null,
    images,
    sizes: [],
    vendor: null,
    tags: [],
    slug: slugify(title),
    sourceUrl: url.toString(),
  }
}

async function fetchHtml(url: URL): Promise<string | null> {
  try {
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; JerseyWalaBot/1.0; +https://thejerseywala.in)',
        Accept: 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let body: { url?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (!body.url) return NextResponse.json({ error: 'url is required' }, { status: 400 })

  let url: URL
  try {
    url = new URL(body.url)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('bad protocol')
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  // Strategy 1: Shopify
  const shopify = await tryShopify(url)
  if (shopify) {
    return NextResponse.json({ success: true, product: shopify })
  }

  // Strategy 2 & 3: fetch HTML, try JSON-LD, then OG
  const html = await fetchHtml(url)
  if (!html) {
    return NextResponse.json(
      { error: 'Could not fetch the URL. The site may block scraping.' },
      { status: 502 },
    )
  }

  const jsonLdItems = extractJsonLdProducts(html)
  const jsonLd = pickJsonLdProduct(jsonLdItems, html, url)
  if (jsonLd) {
    return NextResponse.json({ success: true, product: jsonLd })
  }

  const og = tryOpenGraph(html, url)
  if (og) {
    return NextResponse.json({ success: true, product: og })
  }

  return NextResponse.json(
    { error: 'No product data found on this URL.' },
    { status: 404 },
  )
}
