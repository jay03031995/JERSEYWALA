'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import type { CartItem as CartItemType } from '@/store/cartStore'

export default function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <div
      className="flex gap-3 py-4 last:border-0"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div
        className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0"
        style={{ background: 'var(--bg-raised)' }}
      >
        <Image
          src={item.imageUrl || '/placeholder-jersey.png'}
          alt={item.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
          {item.teamName}
        </p>
        <p className="text-[13px] font-semibold line-clamp-2" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
          {item.name}
        </p>
        {item.playerName && (
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
            {item.playerName}
          </p>
        )}
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
          Size: <span className="font-medium">{item.size}</span>
        </p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
              className="p-1 rounded-md transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-raised)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Minus size={12} />
            </button>
            <span
              className="w-8 text-center text-[13px] font-medium"
              style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}
            >
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
              className="p-1 rounded-md transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-raised)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Plus size={12} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold" style={{ color: 'var(--fg)', fontFamily: 'var(--font-oswald)' }}>
              {formatPrice(item.price * item.quantity)}
            </span>
            <button
              onClick={() => removeItem(item.variantId)}
              className="p-1 transition-colors"
              style={{ color: 'var(--fg-sub)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--red)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--fg-sub)')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
