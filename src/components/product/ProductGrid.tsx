import ProductCard from './ProductCard'
import SkeletonCard from '@/components/ui/SkeletonCard'
import type { Product } from '@/types/database'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  skeletonCount?: number
}

export default function ProductGrid({ products: productsProp, loading, skeletonCount = 8 }: ProductGridProps) {
  const products = productsProp ?? []
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--fg-muted)' }}>
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-lg font-medium" style={{ fontFamily: 'var(--font-oswald)' }}>No jerseys found</p>
        <p className="text-[13px] mt-1" style={{ fontFamily: 'var(--font-inter)' }}>Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
