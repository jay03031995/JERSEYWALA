'use client'

import type { ProductVariant } from '@/types/database'

interface SizeSelectorProps {
  variants: ProductVariant[]
  selectedSize: string
  onChange: (size: string) => void
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

export default function SizeSelector({ variants, selectedSize, onChange }: SizeSelectorProps) {
  const sorted = [...variants].sort(
    (a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-[13px] font-semibold uppercase tracking-[0.06em]"
          style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}
        >
          Select Size
        </p>
        <button
          className="text-[12px] underline"
          style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
        >
          Size Guide
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sorted.map((variant) => {
          const outOfStock = variant.stock_quantity === 0
          const active = selectedSize === variant.size && !outOfStock
          return (
            <button
              key={variant.id}
              disabled={outOfStock}
              onClick={() => onChange(variant.size)}
              className="relative h-11 min-w-[44px] px-3 rounded-lg text-[13px] font-medium transition-all"
              style={{
                background: active ? 'var(--fg)' : 'transparent',
                color: outOfStock ? 'var(--fg-sub)' : active ? 'var(--bg)' : 'var(--fg-muted)',
                border: `2px solid ${active ? 'var(--fg)' : outOfStock ? 'var(--border-sub)' : 'var(--border)'}`,
                cursor: outOfStock ? 'not-allowed' : 'pointer',
                textDecoration: outOfStock ? 'line-through' : 'none',
                fontFamily: 'var(--font-inter)',
              }}
            >
              {variant.size}
            </button>
          )
        })}
      </div>
      {sorted.every((v) => v.stock_quantity === 0) && (
        <p
          className="text-[13px] mt-2"
          style={{ color: 'var(--red)', fontFamily: 'var(--font-inter)' }}
        >
          All sizes are currently out of stock.
        </p>
      )}
    </div>
  )
}
