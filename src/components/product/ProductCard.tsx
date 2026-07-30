'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { formatPrice, getDiscountPercent, productPath } from '@/lib/utils'
import type { Product } from '@/types/database'
import ResilientProductImage, { firstProductImage } from './ResilientProductImage'

export default function ProductCard({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState('')
  const [showSizes, setShowSizes] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const { toggle, has } = useWishlistStore()

  const image = firstProductImage(product)
  const variants = product.variants ?? []
  const availableVariants = variants.filter((variant) => variant.stock_quantity > 0)
  const inStock = availableVariants.length > 0
  const discount = getDiscountPercent(product.base_price, product.compare_price ?? 0)
  const isWishlisted = has(product.id)

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowSizes(true)
      return
    }
    const variant = variants.find((item) => item.size === selectedSize)
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
      imageUrl: image,
      teamName: product.team?.name ?? '',
    })
    setShowSizes(false)
  }

  return (
    <article className="product-card">
      <div className="product-card__media">
        <div className="product-card__badges" aria-label="Product labels">
          {discount > 0 && <span className="product-badge">{discount}% off</span>}
          {product.is_new_arrival && <span className="product-badge">New</span>}
        </div>
        <button
          type="button"
          onClick={() => toggle(product.id)}
          className="icon-button product-card__wishlist"
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={isWishlisted}
        >
          <Heart aria-hidden="true" size={17} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
        <Link href={productPath(product.slug)} aria-label={`View ${product.name}`}>
          <ResilientProductImage product={product} />
        </Link>
      </div>

      <div className="product-card__content">
        {(product.team?.name || product.season) && (
          <p className="product-card__meta">
            {[product.team?.name, product.season].filter(Boolean).join(' · ')}
          </p>
        )}
        <Link href={productPath(product.slug)}>
          <h3>{product.name}</h3>
        </Link>
        <div className="product-card__price">
          <strong>{formatPrice(product.base_price)}</strong>
          {product.compare_price && <s>{formatPrice(product.compare_price)}</s>}
        </div>

        <div className="size-selector" aria-label={`Choose size for ${product.name}`}>
          {(showSizes ? availableVariants : variants.slice(0, 5)).map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSelectedSize(variant.size)}
              disabled={variant.stock_quantity === 0}
              className={selectedSize === variant.size ? 'is-selected' : ''}
              aria-pressed={selectedSize === variant.size}
            >
              {variant.size}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="product-card__add"
          onClick={handleAddToCart}
          disabled={!inStock}
        >
          <ShoppingBag aria-hidden="true" size={15} />
          {inStock ? (showSizes && !selectedSize ? 'Select a size' : 'Add to bag') : 'Out of stock'}
        </button>
      </div>
    </article>
  )
}
