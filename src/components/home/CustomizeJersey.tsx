'use client'

import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types/database'
import { productMatchesSport, type StoreSport, useSportPreference } from '@/components/sport/SportPreference'
import SectionHeader from '@/components/home/SectionHeader'

const FALLBACK_IMAGE = '/images/jersey-fallback.jpg'
const NAME_MAX = 12
const NUMBER_MAX = 2

function primaryImage(product: Product): string {
  return product.images?.find((image) => image.is_primary)?.url ??
    product.images?.[0]?.url ??
    FALLBACK_IMAGE
}

function ProductImage({ product, className = '' }: { product: Product; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={primaryImage(product)}
      alt={product.name}
      width="640"
      height="640"
      className={className}
      referrerPolicy="no-referrer"
      onError={(event) => {
        event.currentTarget.onerror = null
        event.currentTarget.src = FALLBACK_IMAGE
      }}
    />
  )
}

function JerseyConfigurator({ products, sport }: { products: Product[]; sport: StoreSport }) {
  const usable = products.filter(
    (product) => productMatchesSport(product, sport) && (product.variants?.length ?? 0) > 0,
  )
  const addItem = useCartStore((state) => state.addItem)
  const [selectedId, setSelectedId] = useState(usable[0]?.id ?? '')
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [size, setSize] = useState('')

  if (usable.length === 0) return null

  const product = usable.find((item) => item.id === selectedId) ?? usable[0]
  const variants = (product.variants ?? []).filter((variant) => variant.stock_quantity > 0)

  const handleAdd = () => {
    if (!name.trim()) return toast.error('Enter a name to print')
    if (!size) return toast.error('Select a size')
    const variant = variants.find((item) => item.size === size)
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
    toast.success('Custom jersey added to bag')
  }

  return (
    <section id="customize" className="customizer-section">
      <div className="site-container">
        <div className="customizer">
          <div className="customizer__gallery">
            <div className="customizer__thumbnails" aria-label="Choose jersey">
              {usable.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id)
                    setSize('')
                  }}
                  className={item.id === product.id ? 'is-selected' : ''}
                  aria-label={`Preview ${item.name}`}
                  aria-pressed={item.id === product.id}
                >
                  <ProductImage product={item} />
                </button>
              ))}
            </div>
            <div className="customizer__preview">
              <ProductImage product={product} />
              <div className="customizer__print" aria-live="polite">
                <strong>{name.trim().toUpperCase() || 'YOUR NAME'}</strong>
                <span>{number.trim() || '00'}</span>
              </div>
            </div>
          </div>

          <div className="customizer__controls">
            <SectionHeader
              eyebrow="Make it yours"
              title="Customize & Print Your Name"
              description="Add your name and number and make it truly yours."
              compact
            />

            <div className="customizer__product">
              <strong>{product.name}</strong>
              <span>{formatPrice(product.base_price)}</span>
            </div>

            <div className="form-grid">
              <label>
                <span>Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value.slice(0, NAME_MAX))}
                  maxLength={NAME_MAX}
                  autoComplete="off"
                  placeholder="e.g. SHARMA"
                />
                <small>{name.length}/{NAME_MAX}</small>
              </label>
              <label>
                <span>Number</span>
                <input
                  value={number}
                  onChange={(event) => setNumber(event.target.value.replace(/\D/g, '').slice(0, NUMBER_MAX))}
                  inputMode="numeric"
                  maxLength={NUMBER_MAX}
                  placeholder="e.g. 10"
                />
                <small>{number.length}/{NUMBER_MAX}</small>
              </label>
            </div>

            <fieldset className="customizer__sizes">
              <legend>Size</legend>
              <div className="size-selector">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSize(variant.size)}
                    className={variant.size === size ? 'is-selected' : ''}
                    aria-pressed={variant.size === size}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </fieldset>

            <button type="button" className="primary-button customizer__add" onClick={handleAdd}>
              <ShoppingBag aria-hidden="true" size={16} />
              Add custom jersey to bag
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function CustomizeJersey({ products }: { products: Product[] }) {
  const { sport } = useSportPreference()
  return <JerseyConfigurator key={sport} products={products} sport={sport} />
}
