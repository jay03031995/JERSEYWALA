import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import ProductForm from '@/components/admin/ProductForm'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const admin = createAdminClient()

  const [{ data: product }, { data: teams }] = await Promise.all([
    admin.from('products')
      .select('*, images:product_images(*), variants:product_variants(*)')
      .eq('id', params.id)
      .single(),
    admin.from('teams').select('id, name, slug').order('name'),
  ])

  if (!product) notFound()

  const images = (product.images as { url: string }[] ?? []).map((i) => i.url)
  const variants = (product.variants as {
    size: string; stock_quantity: number; additional_price: number; sku: string
  }[] ?? []).map((v) => ({
    size: v.size,
    stock_quantity: v.stock_quantity,
    additional_price: v.additional_price ?? 0,
    sku: v.sku ?? '',
  }))

  return (
    <div className="px-6 py-8">
      <ProductForm
        teams={teams ?? []}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description ?? '',
          team_id: product.team_id ?? '',
          player_name: product.player_name ?? '',
          player_number: product.player_number ?? '',
          season: product.season ?? '',
          jersey_type: product.jersey_type,
          edition: product.edition,
          base_price: String(product.base_price),
          compare_price: product.compare_price ? String(product.compare_price) : '',
          cost_price: product.cost_price ? String(product.cost_price) : '',
          is_active: product.is_active,
          is_featured: product.is_featured,
          is_new_arrival: product.is_new_arrival,
          meta_title: product.meta_title ?? '',
          meta_description: product.meta_description ?? '',
          tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
          images,
          variants,
        }}
      />
    </div>
  )
}
