'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductImage } from '@/types/database'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)

  const sorted = [...images].sort((a, b) => {
    if (a.is_primary) return -1
    if (b.is_primary) return 1
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
        <span style={{ fontSize: '64px' }}>👕</span>
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
        <Image
          src={sorted[selected].url}
          alt={sorted[selected].alt_text ?? productName}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
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
              <Image
                src={img.url}
                alt={img.alt_text ?? `View ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
