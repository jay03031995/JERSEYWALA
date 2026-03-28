'use client'

import { useState } from 'react'
import { ShoppingBag, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import SizeSelector from './SizeSelector'
import toast from 'react-hot-toast'
import type { Product } from '@/types/database'

export default function AddToCartButton({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState('')
  const addItem = useCartStore((s) => s.addItem)
  const { toggle, has } = useWishlistStore()
  const isWishlisted = has(product.id)

  const primaryImage =
    product.images?.find((i) => i.is_primary)?.url ?? product.images?.[0]?.url ?? ''

  const handleAdd = () => {
    if (!selectedSize) {
      toast.error('Please select a size first')
      return
    }
    const variant = product.variants?.find((v) => v.size === selectedSize)
    if (!variant) return

    addItem({
      id: `${product.id}-${variant.id}`,
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      playerName: product.player_name,
      size: selectedSize,
      price: product.base_price + variant.additional_price,
      quantity: 1,
      imageUrl: primaryImage,
      teamName: product.team?.name ?? '',
    })
    toast.success('Added to cart!')
  }

  return (
    <div className="space-y-4">
      <SizeSelector
        variants={product.variants ?? []}
        selectedSize={selectedSize}
        onChange={setSelectedSize}
      />

      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-opacity hover:opacity-90"
          style={{
            background: 'var(--red)',
            color: '#fff',
            fontFamily: 'var(--font-inter)',
            fontSize: '14px',
          }}
        >
          <ShoppingBag size={18} />
          Add to Cart
        </button>
        <button
          onClick={() => {
            toggle(product.id)
            toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
          }}
          className="p-3.5 rounded-xl transition-all"
          style={{
            border: `2px solid ${isWishlisted ? 'var(--red)' : 'var(--border)'}`,
            background: isWishlisted ? 'rgba(232,25,44,0.08)' : 'transparent',
            color: isWishlisted ? 'var(--red)' : 'var(--fg-muted)',
          }}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  )
}
