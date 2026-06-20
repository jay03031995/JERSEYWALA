'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useWishlistStore } from '@/store/wishlistStore'
import { createClient } from '@/lib/supabase/client'
import ProductCard from '@/components/product/ProductCard'
import type { Product } from '@/types/database'

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (items.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select(
          `
          *,
          team:teams(*, league:leagues(*, sport:sports(*))),
          images:product_images(*),
          variants:product_variants(*)
        `
        )
        .in('id', items)
        .eq('is_active', true)
      if (active) {
        setProducts((data as Product[]) ?? [])
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [items])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <h1
        className="text-3xl font-black mb-8"
        style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
      >
        My Wishlist
      </h1>

      {loading ? (
        <p className="text-[13px]" style={{ color: 'var(--fg-muted)' }}>Loading…</p>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💔</div>
          <p className="text-lg font-medium" style={{ color: 'var(--fg-muted)' }}>Your wishlist is empty</p>
          <Link href="/shop" className="mt-2 inline-block text-[13px] font-medium" style={{ color: 'var(--red)' }}>
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
