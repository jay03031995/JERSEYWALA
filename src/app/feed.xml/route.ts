import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const SITE_URL = 'https://thejerseywala.in'
const SITE_NAME = 'The Jersey Wala'

export const revalidate = 3600 // refresh hourly

type ProductRow = {
  id: string
  slug: string
  name: string
  description: string | null
  base_price: number
  compare_price: number | null
  jersey_type: string | null
  edition: string | null
  is_active: boolean
  team: { name: string | null; slug: string | null } | null
  product_images: { url: string; position: number; is_primary: boolean }[]
  product_variants: { size: string; stock_quantity: number; sku: string | null }[]
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function cdata(s: string): string {
  return `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}

function buildItem(p: ProductRow, variant: ProductRow['product_variants'][number] | null): string {
  const link = `${SITE_URL}/shop/${p.slug}`
  const brand = p.team?.name ?? SITE_NAME
  const images = (p.product_images ?? []).sort((a, b) => a.position - b.position)
  const primary = images[0]?.url
  if (!primary) return ''

  const additional = images.slice(1, 11).map((i) => i.url)
  const description = (p.description ?? `${p.name} — premium jersey at ${SITE_NAME}.`).slice(0, 5000)

  const id = variant ? `${p.id}-${variant.size}` : p.id
  const itemGroupId = p.id
  const size = variant?.size
  const availability =
    variant && variant.stock_quantity > 0 ? 'in_stock' : 'out_of_stock'

  const price = p.base_price.toFixed(2)
  const compare = p.compare_price ? p.compare_price.toFixed(2) : null

  const lines: string[] = [
    '  <item>',
    `    <g:id>${xmlEscape(id)}</g:id>`,
    `    <g:item_group_id>${xmlEscape(itemGroupId)}</g:item_group_id>`,
    `    <title>${cdata(p.name)}</title>`,
    `    <description>${cdata(description)}</description>`,
    `    <link>${xmlEscape(link)}</link>`,
    `    <g:image_link>${xmlEscape(primary)}</g:image_link>`,
    ...additional.map((u) => `    <g:additional_image_link>${xmlEscape(u)}</g:additional_image_link>`),
    `    <g:availability>${availability}</g:availability>`,
    `    <g:price>${price} INR</g:price>`,
    compare && Number(compare) > Number(price)
      ? `    <g:sale_price>${price} INR</g:sale_price>`
      : '',
    `    <g:brand>${cdata(brand)}</g:brand>`,
    `    <g:condition>new</g:condition>`,
    `    <g:identifier_exists>no</g:identifier_exists>`,
    `    <g:google_product_category>5697</g:google_product_category>`,
    `    <g:product_type>${cdata('Apparel & Accessories > Clothing > Activewear > Jerseys')}</g:product_type>`,
    size ? `    <g:size>${xmlEscape(size)}</g:size>` : '',
    variant?.sku ? `    <g:mpn>${xmlEscape(variant.sku)}</g:mpn>` : '',
    `    <g:age_group>adult</g:age_group>`,
    `    <g:gender>unisex</g:gender>`,
    `    <g:shipping>
      <g:country>IN</g:country>
      <g:service>Standard</g:service>
      <g:price>0.00 INR</g:price>
    </g:shipping>`,
    '  </item>',
  ]

  return lines.filter(Boolean).join('\n')
}

export async function GET() {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('products')
    .select(
      `id, slug, name, description, base_price, compare_price, jersey_type, edition, is_active,
       team:teams(name, slug),
       product_images(url, position, is_primary),
       product_variants(size, stock_quantity, sku)`,
    )
    .eq('is_active', true)
    .limit(5000)

  if (error) {
    return new NextResponse(`<!-- error: ${error.message} -->`, {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    })
  }

  const products = (data ?? []) as unknown as ProductRow[]

  const items: string[] = []
  for (const p of products) {
    if (!p.product_images || p.product_images.length === 0) continue
    if (!p.product_variants || p.product_variants.length === 0) {
      const line = buildItem(p, null)
      if (line) items.push(line)
      continue
    }
    for (const v of p.product_variants) {
      const line = buildItem(p, v)
      if (line) items.push(line)
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${cdata(SITE_NAME)}</title>
  <link>${SITE_URL}</link>
  <description>${cdata('Authentic sports jerseys delivered across India.')}</description>
${items.join('\n')}
</channel>
</rss>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
