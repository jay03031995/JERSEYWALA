'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductGrid from '@/components/product/ProductGrid'
import type { Product } from '@/types/database'
import { productMatchesSport, useSportPreference } from '@/components/sport/SportPreference'

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
  const { sport } = useSportPreference()
  const visibleProducts = products.filter((product) => productMatchesSport(product, sport))
  if (visibleProducts.length === 0) return null

  return (
    <section
      id={id}
      className="home-product-rail"
      style={{
        borderTop: '1px solid var(--border)',
        background: tinted ? 'var(--bg-card)' : 'var(--bg)',
      }}
    >
      <div className="home-product-rail__inner">
        <div className="home-product-rail__intro">
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
              style={{ color: 'var(--fg)' }}
            >
              {title}
            </h2>
            <span>
              {title.toLowerCase().includes('hero')
                ? 'Rep your legend. Relive their glory.'
                : 'The latest jerseys and fan gear, just landed.'}
            </span>
          </div>
          {ctaHref && (
            <Link
              href={ctaHref}
            >
              {ctaLabel} <ArrowRight size={14} />
            </Link>
          )}
        </div>
        <div className="home-product-rail__products">
          <ProductGrid products={visibleProducts.slice(0, 4)} />
        </div>
      </div>
    </section>
  )
}
