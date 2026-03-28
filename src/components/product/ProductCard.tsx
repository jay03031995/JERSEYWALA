'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { formatPrice, getDiscountPercent } from '@/lib/utils'
import type { Product } from '@/types/database'

export default function ProductCard({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState('')
  const [showSizes, setShowSizes] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const { toggle, has } = useWishlistStore()

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.url ??
    product.images?.[0]?.url ??
    '/placeholder-jersey.png'

  const inStock = product.variants?.some((v) => v.stock_quantity > 0) ?? false
  const discount = getDiscountPercent(product.base_price, product.compare_price ?? 0)
  const isWishlisted = has(product.id)

  const handleAddToCart = () => {
    if (!selectedSize) { setShowSizes(true); return }
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
    setShowSizes(false)
  }

  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 40px rgba(0,0,0,0.4)'
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-sub)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
      }}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {discount > 0 && (
          <span
            className="text-white text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'var(--red)' }}
          >
            -{discount}%
          </span>
        )}
        {product.is_new_arrival && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'var(--green)', color: '#000' }}
          >
            New
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={() => toggle(product.id)}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full transition-colors"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      >
        <Heart
          size={13}
          style={{
            fill: isWishlisted ? 'var(--red)' : 'transparent',
            color: isWishlisted ? 'var(--red)' : 'rgba(255,255,255,0.6)',
          }}
        />
      </button>

      {/* Image */}
      <Link href={`/shop/${product.slug}`}>
        <div className="aspect-square relative overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.06em] mb-1"
          style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
        >
          {product.team?.name}{product.season ? ` · ${product.season}` : ''}
        </p>

        <Link href={`/shop/${product.slug}`}>
          <h3
            className="text-[14px] font-medium line-clamp-2 leading-snug transition-colors"
            style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}
          >
            {product.name}
          </h3>
        </Link>

        {product.player_name && (
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
            #{product.player_number} {product.player_name}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2.5">
          <span className="text-[16px] font-bold" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
            {formatPrice(product.base_price)}
          </span>
          {product.compare_price && (
            <span className="text-[12px] line-through font-normal" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
              {formatPrice(product.compare_price)}
            </span>
          )}
        </div>

        {/* Sizes */}
        {showSizes && (
          <div className="mt-3">
            <p className="text-[10px] font-medium mb-1.5 uppercase tracking-[0.06em]" style={{ color: 'var(--red)', fontFamily: 'var(--font-inter)' }}>
              Pick a size
            </p>
            <div className="flex flex-wrap gap-1">
              {product.variants?.filter((v) => v.stock_quantity > 0).map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedSize(v.size)}
                  className="px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all"
                  style={{
                    border: `1px solid ${selectedSize === v.size ? 'var(--fg)' : 'var(--border)'}`,
                    background: selectedSize === v.size ? 'var(--fg)' : 'transparent',
                    color: selectedSize === v.size ? 'var(--bg)' : 'var(--fg-muted)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>
        )}

        {!showSizes && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {product.variants?.slice(0, 5).map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedSize(v.size)}
                disabled={v.stock_quantity === 0}
                className="text-[10px] px-2 py-0.5 rounded-md transition-all"
                style={{
                  border: `1px solid ${
                    v.stock_quantity === 0
                      ? 'var(--border-sub)'
                      : selectedSize === v.size
                      ? 'var(--fg)'
                      : 'var(--border)'
                  }`,
                  background: selectedSize === v.size ? 'var(--fg)' : 'transparent',
                  color:
                    v.stock_quantity === 0
                      ? 'var(--fg-sub)'
                      : selectedSize === v.size
                      ? 'var(--bg)'
                      : 'var(--fg-muted)',
                  textDecoration: v.stock_quantity === 0 ? 'line-through' : 'none',
                  cursor: v.stock_quantity === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {v.size}
              </button>
            ))}
          </div>
        )}

        {/* Add to Bag */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="mt-3.5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
          style={{
            background: inStock ? 'var(--fg)' : 'var(--bg-raised)',
            color: inStock ? 'var(--bg)' : 'var(--fg-sub)',
            opacity: inStock ? 1 : 0.5,
            cursor: inStock ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-inter)',
          }}
        >
          <ShoppingBag size={13} />
          {inStock ? 'Add to Bag' : 'Out of Stock'}
        </button>
      </div>
    </div>
  )
}
