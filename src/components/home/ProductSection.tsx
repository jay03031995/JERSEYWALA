'use client'

import ProductGrid from '@/components/product/ProductGrid'
import SectionHeader from '@/components/home/SectionHeader'
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
      className={`home-product-rail${tinted ? ' home-product-rail--tinted' : ''}`}
    >
      <div className="site-container home-product-rail__inner">
        <SectionHeader
          eyebrow={eyebrow ?? 'Curated for fans'}
          title={title}
          description={title.toLowerCase().includes('hero')
            ? 'Rep your legend. Relive their glory.'
            : 'The latest jerseys and fan gear, just landed.'}
          href={ctaHref}
          action={ctaLabel}
          compact
        />
        <div className="home-product-rail__products">
          <ProductGrid products={visibleProducts.slice(0, 4)} />
        </div>
      </div>
    </section>
  )
}
