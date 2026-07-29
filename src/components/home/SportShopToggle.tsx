'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Award, KeyRound, Shield, Shirt, Trophy } from 'lucide-react'
import ProductGrid from '@/components/product/ProductGrid'
import type { Product } from '@/types/database'
import { productMatchesSport, useSportPreference } from '@/components/sport/SportPreference'

const SHOP = {
  football: {
    label: 'Football',
    eyebrow: 'For the beautiful game',
    title: 'Football fan zone',
    description: 'Club and country jerseys, fan keychains, trophies and match-day tackle.',
    href: '/sport/football',
    categories: [
      { label: 'Football jerseys', query: '/shop?sport=football&category=jersey', icon: Shirt },
      { label: 'Keychains', query: '/shop?sport=football&category=keychain', icon: KeyRound },
      { label: 'Trophies', query: '/shop?sport=football&category=trophy', icon: Trophy },
      { label: 'Match tackle', query: '/shop?sport=football&category=tackle', icon: Shield },
    ],
  },
  cricket: {
    label: 'Cricket',
    eyebrow: 'For every innings',
    title: 'Cricket fan zone',
    description: 'India and IPL jerseys, cricket keychains, trophies and essential tackle.',
    href: '/sport/cricket',
    categories: [
      { label: 'Cricket jerseys', query: '/shop?sport=cricket&category=jersey', icon: Shirt },
      { label: 'Keychains', query: '/shop?sport=cricket&category=keychain', icon: KeyRound },
      { label: 'Trophies', query: '/shop?sport=cricket&category=trophy', icon: Award },
      { label: 'Cricket tackle', query: '/shop?sport=cricket&category=tackle', icon: Shield },
    ],
  },
}

export default function SportShopToggle({ products }: { products: Product[] }) {
  const { sport } = useSportPreference()
  const content = SHOP[sport]

  const filtered = useMemo(() => {
    return products.filter((product) => productMatchesSport(product, sport)).slice(0, 8)
  }, [products, sport])

  return (
    <section className="sport-shop" aria-labelledby="sport-shop-heading">
      <div className="sport-shop__inner">
        <div className="sport-shop__heading">
          <div>
            <p className="section-kicker">{content.eyebrow}</p>
            <h2 id="sport-shop-heading">{content.title}</h2>
            <p>{content.description}</p>
          </div>
          <Link href={content.href}>
            Shop all {content.label} <ArrowRight size={16} />
          </Link>
        </div>

        <div className="sport-categories">
          {content.categories.map(({ label, query, icon: Icon }) => (
            <Link key={label} href={query}>
              <span><Icon size={24} strokeWidth={1.7} /></span>
              <strong>{label}</strong>
              <ArrowRight size={15} />
            </Link>
          ))}
        </div>

        {filtered.length > 0 && (
          <div className="sport-shop__products">
            <ProductGrid products={filtered} />
          </div>
        )}
      </div>
    </section>
  )
}
