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
      <div className="product-grid">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="product-grid__empty">
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p>No jerseys found</p>
        <span>Try adjusting your filters</span>
      </div>
    )
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
