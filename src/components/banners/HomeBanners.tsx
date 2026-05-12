import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

type Banner = {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  cta_text: string | null
  cta_link: string | null
}

async function fetchHeroBanners(): Promise<Banner[]> {
  try {
    const admin = createAdminClient()
    const now = new Date().toISOString()
    const { data } = await admin
      .from('banners')
      .select('id, title, subtitle, image_url, cta_text, cta_link, starts_at, ends_at')
      .eq('is_active', true)
      .eq('position', 'homepage_hero')
      .order('display_order', { ascending: true })

    const rows = data ?? []
    return rows.filter((b) => {
      if (b.starts_at && b.starts_at > now) return false
      if (b.ends_at && b.ends_at < now) return false
      return true
    }) as Banner[]
  } catch {
    return []
  }
}

export default async function HomeBanners() {
  const banners = await fetchHeroBanners()
  if (banners.length === 0) return null

  return (
    <section
      className="px-5 sm:px-8 py-6"
      style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-7xl mx-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {banners.slice(0, 6).map((b) => {
          const inner = (
            <div
              className="relative rounded-2xl overflow-hidden h-44 sm:h-52 group"
              style={{ border: '1px solid var(--border)' }}
            >
              {b.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.image_url}
                  alt={b.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div
                className="absolute inset-0 flex flex-col justify-end p-5"
                style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.78) 100%)' }}
              >
                <p
                  className="text-white text-[18px] sm:text-[20px] font-bold leading-tight"
                  style={{ fontFamily: 'var(--font-oswald)' }}
                >
                  {b.title}
                </p>
                {b.subtitle && (
                  <p className="text-white/80 text-[12px] mt-1" style={{ fontFamily: 'var(--font-inter)' }}>
                    {b.subtitle}
                  </p>
                )}
                {b.cta_text && (
                  <span
                    className="inline-flex items-center self-start mt-3 px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                    style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
                  >
                    {b.cta_text}
                  </span>
                )}
              </div>
            </div>
          )

          return b.cta_link ? (
            <Link key={b.id} href={b.cta_link} className="block">
              {inner}
            </Link>
          ) : (
            <div key={b.id}>{inner}</div>
          )
        })}
      </div>
    </section>
  )
}
