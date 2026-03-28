import { createAdminClient } from '@/lib/supabase/admin'
import ProductForm from '@/components/admin/ProductForm'

export default async function NewProductPage() {
  const admin = createAdminClient()
  const { data: teams } = await admin.from('teams').select('id, name, slug').order('name')

  return (
    <div className="px-6 py-8">
      <ProductForm teams={teams ?? []} />
    </div>
  )
}
