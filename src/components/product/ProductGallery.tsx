'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductImage } from '@/types/database'

const DEFAULT_PRODUCT_IMAGE = '/images/default-sports-product.jpg'
const usableImage = (image: ProductImage) =>
  Boolean(image.url?.trim()) &&
  !image.url.includes('placehold.co') &&
  !image.url.includes('placeholder')

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)

  const sorted = [...images].filter(usableImage).sort((a, b) => {
    const aLocal = a.url.startsWith('/images/cricket/')
    const bLocal = b.url.startsWith('/images/cricket/')
    if (aLocal !== bLocal) return aLocal ? 1 : -1
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1
    return a.position - b.position
  })

  const prev = () => setSelected((s) => (s === 0 ? sorted.length - 1 : s - 1))
  const next = () => setSelected((s) => (s === sorted.length - 1 ? 0 : s + 1))

  if (sorted.length === 0) {
    return (
      <div
        className="aspect-square rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={DEFAULT_PRODUCT_IMAGE}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden group"
        style={{ background: 'var(--bg-raised)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sorted[selected].url}
          alt={sorted[selected].alt_text ?? productName}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          onError={(event) => {
            event.currentTarget.src = DEFAULT_PRODUCT_IMAGE
          }}
        />
        {sorted.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(6px)' }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(6px)' }}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelected(i)}
              className="relative w-16 h-16 rounded-lg overflow-hidden transition-all"
              style={{
                border: `2px solid ${selected === i ? 'var(--fg)' : 'var(--border)'}`,
                opacity: selected === i ? 1 : 0.6,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt_text ?? `View ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.src = DEFAULT_PRODUCT_IMAGE
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
