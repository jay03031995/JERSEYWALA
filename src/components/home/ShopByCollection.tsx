'use client'

import Link from 'next/link'
import { ArrowRight, Award, KeyRound, Shield, Shirt, Sparkles } from 'lucide-react'
import { useSportPreference } from '@/components/sport/SportPreference'

export type CollectionTile = {
  label: string
  href: string
  image: string
}

export default function ShopByCollection({ tiles }: { tiles: CollectionTile[] }) {
  const { sport } = useSportPreference()
  const sportTile = tiles.find((tile) => {
    const text = `${tile.label} ${tile.href}`.toLowerCase()
    return sport === 'cricket'
      ? text.includes('cricket') || text.includes('ipl')
      : text.includes('football')
  })

  const collections = [
    { label: sport === 'football' ? 'Football' : 'Cricket', href: `/sport/${sport}`, image: sportTile?.image },
    { label: 'Jerseys', href: `/shop?sport=${sport}&category=jersey`, Icon: Shirt },
    { label: 'Trophies', href: `/shop?sport=${sport}&category=trophy`, Icon: Award },
    { label: 'Keychains', href: `/shop?sport=${sport}&category=keychain`, Icon: KeyRound },
    { label: 'Match Tackle', href: `/shop?sport=${sport}&category=tackle`, Icon: Shield },
    { label: 'Accessories', href: `/shop?sport=${sport}&category=tackle`, Icon: Sparkles },
  ]

  return (
    <section className="home-collections">
      <div className="home-collections__inner">
        <div className="home-collections__intro">
          <p>Shop by collection</p>
          <h1>Explore. Choose. Wear.</h1>
          <span>Premium jerseys, collectibles and more for every kind of fan.</span>
        </div>
        <div className="home-collections__list">
          {collections.map(({ label, href, image, Icon }) => (
            <Link key={label} href={href}>
              <span className="home-collections__circle">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = '/images/jersey-fallback.jpg'
                    }}
                  />
                ) : Icon ? <Icon size={34} strokeWidth={1.35} /> : null}
              </span>
              <strong>{label}</strong>
            </Link>
          ))}
          <Link href={`/shop?sport=${sport}`} className="home-collections__next" aria-label="View all collections">
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
