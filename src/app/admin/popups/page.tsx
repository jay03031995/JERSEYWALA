import { createAdminClient } from '@/lib/supabase/admin'
import PopupManager from '@/components/admin/PopupManager'

export default async function PopupsPage() {
  const admin = createAdminClient()
  const { data: banners } = await admin
    .from('banners')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] font-black" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
          Popups & Banners
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
          Manage featured popups, promotional banners, and announcements
        </p>
      </div>
      <PopupManager banners={banners ?? []} />
    </div>
  )
}
