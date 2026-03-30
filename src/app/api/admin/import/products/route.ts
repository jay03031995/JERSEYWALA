import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map((line) => {
    // Handle quoted fields with commas inside
    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (line[i] === ',' && !inQuotes) {
        values.push(current); current = ''
      } else {
        current += line[i]
      }
    }
    values.push(current)
    return Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? '').trim()]))
  })
}

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

  const text = await file.text()
  const rows = parseCSV(text)
  if (rows.length === 0) return NextResponse.json({ error: 'Empty or invalid CSV' }, { status: 400 })

  const admin = createAdminClient()
  let count = 0
  const errors: string[] = []

  for (const row of rows) {
    try {
      if (!row.name || !row.slug || !row.base_price) continue

      // Resolve team
      let teamId: string | null = null
      if (row.team_slug) {
        const { data: team } = await admin.from('teams').select('id').eq('slug', row.team_slug).single()
        teamId = team?.id ?? null
      }

      // Upsert product
      const { data: product, error } = await admin
        .from('products')
        .upsert({
          name: row.name,
          slug: row.slug,
          description: row.description || null,
          base_price: Number(row.base_price),
          compare_price: row.compare_price ? Number(row.compare_price) : null,
          cost_price: row.cost_price ? Number(row.cost_price) : null,
          team_id: teamId,
          season: row.season || null,
          jersey_type: row.jersey_type || null,
          edition: row.edition || null,
          player_name: row.player_name || null,
          player_number: row.player_number || null,
          is_active: row.is_active !== 'false',
          is_featured: row.is_featured === 'true',
          is_new_arrival: row.is_new_arrival === 'true',
          meta_title: row.meta_title || null,
          meta_description: row.meta_description || null,
          tags: row.tags ? row.tags.split('|').filter(Boolean) : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'slug' })
        .select('id')
        .single()

      if (error || !product) { errors.push(`${row.slug}: ${error?.message}`); continue }
      count++

      // Images
      const images = [row.image_1, row.image_2, row.image_3].filter(Boolean)
      if (images.length > 0) {
        await admin.from('product_images').delete().eq('product_id', product.id)
        for (let i = 0; i < images.length; i++) {
          await admin.from('product_images').insert({
            product_id: product.id, url: images[i], alt_text: row.name,
            position: i, is_primary: i === 0,
          })
        }
      }

      // Variants
      if (row.sizes) {
        const sizes = row.sizes.split('|').filter(Boolean)
        await admin.from('product_variants').delete().eq('product_id', product.id)
        for (const size of sizes) {
          await admin.from('product_variants').insert({
            product_id: product.id, size,
            stock_quantity: 20,
            sku: `${row.slug}-${size.toLowerCase()}`,
            additional_price: 0,
          })
        }
      }
    } catch (e) {
      errors.push(`${row.slug}: ${String(e)}`)
    }
  }

  return NextResponse.json({ success: true, count, errors })
}
