import ImportFromUrl from '@/components/admin/ImportFromUrl'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function ImportUrlPage() {
  const admin = createAdminClient()
  const { data: teams } = await admin.from('teams').select('id, name, slug').order('name')

  return (
    <div className="px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1
          className="text-[28px] font-black"
          style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
        >
          Import from URL
        </h1>
        <p
          className="text-[13px] mt-1"
          style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
        >
          Paste any product URL — Shopify stores, sites with Schema.org or Open Graph product
          tags — and we'll fetch the title, images, price, sizes, and description.
        </p>
      </div>
      <ImportFromUrl teams={teams ?? []} />
    </div>
  )
}
