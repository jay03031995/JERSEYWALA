'use client'

import { useState } from 'react'
import type { Product } from '@/types/database'

export const PRODUCT_FALLBACK_IMAGE = '/images/default-sports-product.jpg'
export const CRICKET_FALLBACK_IMAGES = {
  blue: '/images/cricket/india-blue-cricket-jersey.jpg',
  gold: '/images/cricket/australia-gold-cricket-jersey.jpg',
  green: '/images/cricket/green-cricket-jersey.jpg',
  white: '/images/cricket/test-white-cricket-jersey.jpg',
} as const

function productFallbackImage(product: Product): string {
  const searchable = [
    product.name,
    product.description,
    product.team?.name,
    product.team?.league?.name,
    product.team?.league?.sport?.slug,
    ...(product.tags ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const isCricket =
    /\b(cricket|ipl|t20|odi|test|bcci|csk|rcb|kkr|srh|pbks|lsg)\b/.test(searchable)
  if (!isCricket) return PRODUCT_FALLBACK_IMAGE
  if (/\b(test|white|whites)\b/.test(searchable)) return CRICKET_FALLBACK_IMAGES.white
  if (/\b(australia|aussie|gold)\b/.test(searchable)) return CRICKET_FALLBACK_IMAGES.gold
  if (/\b(pakistan|south africa|bangladesh|green)\b/.test(searchable)) {
    return CRICKET_FALLBACK_IMAGES.green
  }
  return CRICKET_FALLBACK_IMAGES.blue
}

export function productImageUrls(product: Product): string[] {
  const urls = [...(product.images ?? [])]
    .filter((image) => {
      const url = image.url?.trim()
      return Boolean(url) &&
        !url?.includes('placehold.co') &&
        !url?.includes('placeholder')
    })
    .sort((a, b) => {
      const aLocal = a.url.startsWith('/images/cricket/')
      const bLocal = b.url.startsWith('/images/cricket/')
      if (aLocal !== bLocal) return aLocal ? 1 : -1
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1
      return (a.position ?? 0) - (b.position ?? 0)
    })
    .map((image) => image.url.trim())
    .filter((url): url is string =>
      Boolean(url),
    )

  return [...new Set(urls)]
}

export function firstProductImage(product: Product): string {
  return productImageUrls(product)[0] ?? productFallbackImage(product)
}

type Props = {
  product: Product
  className?: string
  width?: number
  height?: number
  loading?: 'eager' | 'lazy'
  decorative?: boolean
}

export default function ResilientProductImage({
  product,
  className,
  width = 480,
  height = 480,
  loading = 'lazy',
  decorative = false,
}: Props) {
  const candidates = [
    ...productImageUrls(product),
    productFallbackImage(product),
    PRODUCT_FALLBACK_IMAGE,
  ]
  const [index, setIndex] = useState(0)

  return (
    // Plain img supports catalogue domains added by administrators at runtime.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={candidates[index]}
      alt={decorative ? '' : product.name}
      width={width}
      height={height}
      className={className}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setIndex((current) => Math.min(current + 1, candidates.length - 1))}
    />
  )
}
