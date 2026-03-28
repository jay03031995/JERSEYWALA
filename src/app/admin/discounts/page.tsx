import { createAdminClient } from '@/lib/supabase/admin'
import DiscountManager from '@/components/admin/DiscountManager'

export default async function AdminDiscountsPage() {
  const admin = createAdminClient()
  const { data: codes } = await admin
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1
          className="text-[28px] font-black"
          style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
        >
          Discount Codes
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
          {codes?.length ?? 0} codes
        </p>
      </div>

      <DiscountManager initialCodes={codes ?? []} />
    </div>
  )
}
