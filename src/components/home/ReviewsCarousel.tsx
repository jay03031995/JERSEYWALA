import Link from 'next/link'
import { Star, BadgeCheck } from 'lucide-react'
import type { HomeReview } from '@/lib/queries/reviews'

function initials(name: string | null): string {
  if (!name) return 'JW'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// Approved customer reviews. Renders nothing when there are none yet, so the
// homepage never shows a placeholder testimonial.
export default function ReviewsCarousel({ reviews }: { reviews: HomeReview[] }) {
  if (!reviews || reviews.length === 0) return null

  return (
    <section style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="mb-10">
          <p
            className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-2"
            style={{ color: 'var(--red)', fontFamily: 'var(--font-inter)' }}
          >
            Fan Reviews
          </p>
          <h2
            className="text-[32px] sm:text-[40px] font-bold uppercase leading-none"
            style={{ fontFamily: 'var(--font-oswald)', letterSpacing: '-0.02em', color: 'var(--fg)' }}
          >
            What Fans Say
          </h2>
        </div>

        <div
          className="flex gap-4 overflow-x-auto pb-3 snap-x"
          style={{ scrollbarWidth: 'none' }}
        >
          {reviews.map((r) => (
            <div
              key={r.id}
              className="snap-start shrink-0 w-[300px] rounded-2xl p-6 flex flex-col"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    style={{
                      fill: i < r.rating ? 'var(--gold)' : 'transparent',
                      color: i < r.rating ? 'var(--gold)' : 'var(--border)',
                    }}
                  />
                ))}
              </div>
              {r.title && (
                <p className="text-[14px] font-bold mb-1.5" style={{ color: 'var(--fg)', fontFamily: 'var(--font-oswald)' }}>
                  {r.title}
                </p>
              )}
              {r.body && (
                <p className="text-[13.5px] leading-relaxed mb-4 flex-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                  &ldquo;{r.body}&rdquo;
                </p>
              )}
              <div className="flex items-center gap-2.5 mt-auto pt-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{ background: 'var(--bg-raised)', color: 'var(--fg)', fontFamily: 'var(--font-oswald)' }}
                >
                  {initials(r.reviewer_name)}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold flex items-center gap-1" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
                    {r.reviewer_name || 'Verified Fan'}
                    {r.is_verified && <BadgeCheck size={13} style={{ color: 'var(--green)' }} />}
                  </p>
                  {r.product_name && (
                    r.product_slug ? (
                      <Link
                        href={`/shop/${r.product_slug}`}
                        className="text-[11px] truncate block"
                        style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
                      >
                        {r.product_name}
                      </Link>
                    ) : (
                      <p className="text-[11px] truncate" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                        {r.product_name}
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
