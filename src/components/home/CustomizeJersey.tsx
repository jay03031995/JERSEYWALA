'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag, PenLine } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types/database'
import { productMatchesSport, useSportPreference } from '@/components/sport/SportPreference'

const NAME_MAX = 12
const NUMBER_MAX = 2

function primaryImage(p: Product): string {
  return p.images?.find((i) => i.is_primary)?.url ?? p.images?.[0]?.url ?? '/placeholder-jersey.png'
}

// Personalise-your-jersey conversion block. Fully client-side: builds a cart
// line with the entered name/number (kept distinct via a composite line id)
// and the real variant id for checkout. Preview is a text overlay on the
// product image (approximation, not a true jersey mockup).
export default function CustomizeJersey({ products }: { products: Product[] }) {
  const { sport } = useSportPreference()
  const usable = products.filter(
    (product) => productMatchesSport(product, sport) && (product.variants?.length ?? 0) > 0,
  )
  const addItem = useCartStore((s) => s.addItem)

  const [selectedId, setSelectedId] = useState(usable[0]?.id ?? '')
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [size, setSize] = useState('')

  useEffect(() => {
    setSelectedId('')
    setSize('')
  }, [sport])

  if (usable.length === 0) return null

  const product = usable.find((p) => p.id === selectedId) ?? usable[0]
  const variants = (product.variants ?? []).filter((v) => v.stock_quantity > 0)

  const handleAdd = () => {
    if (!name.trim()) return toast.error('Enter a name to print')
    if (!size) return toast.error('Select a size')
    const variant = (product.variants ?? []).find((v) => v.size === size)
    if (!variant) return toast.error('That size is unavailable')

    addItem({
      id: `${product.id}-${variant.id}-custom-${name.trim()}-${number.trim()}`,
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      playerName: name.trim().toUpperCase(),
      playerNumber: number.trim() || undefined,
      size,
      price: product.base_price + variant.additional_price,
      quantity: 1,
      imageUrl: primaryImage(product),
      teamName: product.team?.name ?? '',
    })
    toast.success('Custom jersey added to bag!')
  }

  return (
    <section id="customize" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center mb-10">
          <p
            className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-2 inline-flex items-center gap-1.5"
            style={{ color: 'var(--red)', fontFamily: 'var(--font-inter)' }}
          >
            <PenLine size={13} /> Make It Yours
          </p>
          <h2
            className="text-[32px] sm:text-[40px] font-bold uppercase leading-none"
            style={{ fontFamily: 'var(--font-oswald)', letterSpacing: '-0.02em', color: 'var(--fg)' }}
          >
            Customize &amp; Print Your Name
          </h2>
        </div>

        <div
          className="grid lg:grid-cols-2 gap-8 items-stretch rounded-3xl p-5 sm:p-8"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {/* Preview */}
          <div
            className="relative rounded-2xl overflow-hidden min-h-[340px] flex items-center justify-center"
            style={{ background: 'var(--bg-raised)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primaryImage(product)}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: 'rgba(20,15,10,0.28)' }} />
            <div className="relative z-10 flex flex-col items-center text-center px-4">
              <span
                className="uppercase font-bold leading-none"
                style={{
                  color: '#fff',
                  fontFamily: 'var(--font-oswald)',
                  fontSize: 'clamp(22px, 4vw, 34px)',
                  letterSpacing: '0.08em',
                  textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                }}
              >
                {name.trim() ? name.trim().toUpperCase() : 'YOUR NAME'}
              </span>
              <span
                className="font-bold leading-none mt-1"
                style={{
                  color: '#fff',
                  fontFamily: 'var(--font-oswald)',
                  fontSize: 'clamp(64px, 12vw, 120px)',
                  textShadow: '0 4px 18px rgba(0,0,0,0.55)',
                }}
              >
                {number.trim() || '00'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col">
            {/* Jersey picker */}
            <label className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
              Choose a jersey
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5" style={{ scrollbarWidth: 'none' }}>
              {usable.slice(0, 10).map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedId(p.id); setSize('') }}
                  className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all"
                  style={{ border: p.id === product.id ? '2px solid var(--red)' : '1px solid var(--border)' }}
                  aria-label={p.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={primaryImage(p)} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>

            <p className="text-[15px] font-bold mb-1" style={{ color: 'var(--fg)', fontFamily: 'var(--font-oswald)' }}>
              {product.name}
            </p>
            <p className="text-[14px] font-semibold mb-5" style={{ color: 'var(--red)', fontFamily: 'var(--font-oswald)' }}>
              {formatPrice(product.base_price)}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5 block" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
                  maxLength={NAME_MAX}
                  placeholder="e.g. SHARMA"
                  className="w-full px-3 py-2.5 rounded-xl text-[14px] outline-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5 block" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                  Number
                </label>
                <input
                  value={number}
                  onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, NUMBER_MAX))}
                  inputMode="numeric"
                  maxLength={NUMBER_MAX}
                  placeholder="e.g. 45"
                  className="w-full px-3 py-2.5 rounded-xl text-[14px] outline-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}
                />
              </div>
            </div>

            {/* Size */}
            <label className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5 block" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
              Size
            </label>
            <div className="flex flex-wrap gap-2 mb-6">
              {variants.length === 0 && (
                <span className="text-[13px]" style={{ color: 'var(--fg-sub)' }}>Out of stock</span>
              )}
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSize(v.size)}
                  className="px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-colors"
                  style={{
                    border: v.size === size ? '2px solid var(--red)' : '1px solid var(--border)',
                    background: v.size === size ? 'color-mix(in srgb, var(--red) 10%, transparent)' : 'var(--bg)',
                    color: 'var(--fg)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {v.size}
                </button>
              ))}
            </div>

            <button
              onClick={handleAdd}
              disabled={variants.length === 0}
              className="mt-auto inline-flex items-center justify-center gap-2 py-4 rounded-xl text-[14px] font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
            >
              <ShoppingBag size={16} /> Add Custom Jersey to Bag
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
