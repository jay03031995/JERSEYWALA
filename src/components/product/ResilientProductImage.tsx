'use client'

import { useState } from 'react'
import type { Product } from '@/types/database'

export const PRODUCT_FALLBACK_IMAGE = '/images/jersey-fallback.jpg'

export function productImageUrls(product: Product): string[] {
  const ordered = [...(product.images ?? [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1
    return (a.position ?? 0) - (b.position ?? 0)
  })
  const urls = ordered
    .map((image) => image.url?.trim())
    .filter((url): url is string => Boolean(url))

  return [...new Set(urls)]
}

export function firstProductImage(product: Product): string {
  return productImageUrls(product)[0] ?? PRODUCT_FALLBACK_IMAGE
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
  const candidates = [...productImageUrls(product), PRODUCT_FALLBACK_IMAGE]
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
