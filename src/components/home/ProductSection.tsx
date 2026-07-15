import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductGrid from '@/components/product/ProductGrid'
import type { Product } from '@/types/database'

type Props = {
  eyebrow?: string
  title: string
  ctaHref?: string
  ctaLabel?: string
  products: Product[]
  tinted?: boolean
  id?: string
}

// Shared homepage product block: eyebrow + display heading + optional CTA,
// then the standard responsive ProductGrid. Renders nothing when empty so the
// homepage degrades gracefully for a store with sparse data.
export default function ProductSection({
  eyebrow,
  title,
  ctaHref,
  ctaLabel = 'View all',
  products,
  tinted = false,
  id,
}: Props) {
  if (!products || products.length === 0) return null

  return (
    <section
      id={id}
      style={{
        borderTop: '1px solid var(--border)',
        background: tinted ? 'var(--bg-card)' : 'var(--bg)',
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="flex items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            {eyebrow && (
              <p
                className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-2"
                style={{ color: 'var(--red)', fontFamily: 'var(--font-inter)' }}
              >
                {eyebrow}
              </p>
            )}
            <h2
              className="text-[32px] sm:text-[40px] font-bold uppercase leading-none"
              style={{ fontFamily: 'var(--font-oswald)', letterSpacing: '-0.02em', color: 'var(--fg)' }}
            >
              {title}
            </h2>
          </div>
          {ctaHref && (
            <Link
              href={ctaHref}
              className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors"
              style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
            >
              {ctaLabel} <ArrowRight size={13} />
            </Link>
          )}
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  )
}
