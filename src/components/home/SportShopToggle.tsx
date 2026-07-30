'use client'

import Link from 'next/link'
import { ArrowRight, Award, KeyRound, Shield, Shirt, Trophy } from 'lucide-react'
import { useSportPreference } from '@/components/sport/SportPreference'
import SectionHeader from '@/components/home/SectionHeader'

const SHOP = {
  football: {
    label: 'Football',
    eyebrow: 'For the beautiful game',
    title: 'Football fan zone',
    description: 'Shop club and country jerseys, collectibles, trophies and match-day essentials made for real football fans.',
    href: '/sport/football',
    categories: [
      { label: 'Football Jerseys', description: 'Club, country and retro fan favorites', query: '/shop?sport=football&category=jersey', icon: Shirt },
      { label: 'Keychains', description: 'Everyday collectibles for true fans', query: '/shop?sport=football&category=keychain', icon: KeyRound },
      { label: 'Trophies', description: 'Display-worthy football keepsakes', query: '/shop?sport=football&category=trophy', icon: Trophy },
      { label: 'Match Tackle', description: 'Accessories for the match-day mood', query: '/shop?sport=football&category=tackle', icon: Shield },
    ],
  },
  cricket: {
    label: 'Cricket',
    eyebrow: 'For every innings',
    title: 'Cricket fan zone',
    description: 'Shop India and IPL jerseys, collectibles, trophies and match-day essentials made for real cricket fans.',
    href: '/sport/cricket',
    categories: [
      { label: 'Cricket Jerseys', description: 'India, IPL and international favorites', query: '/shop?sport=cricket&category=jersey', icon: Shirt },
      { label: 'Keychains', description: 'Everyday collectibles for true fans', query: '/shop?sport=cricket&category=keychain', icon: KeyRound },
      { label: 'Trophies', description: 'Display-worthy cricket keepsakes', query: '/shop?sport=cricket&category=trophy', icon: Award },
      { label: 'Cricket Tackle', description: 'Accessories for every match-day mood', query: '/shop?sport=cricket&category=tackle', icon: Shield },
    ],
  },
}

export default function SportShopToggle() {
  const { sport } = useSportPreference()
  const content = SHOP[sport]

  return (
    <section className="sport-shop" aria-labelledby="sport-shop-heading">
      <div className="site-container sport-shop__inner">
        <SectionHeader
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
          href={content.href}
          action={`Shop all ${content.label}`}
          id="sport-shop-heading"
        />

        <div className="sport-categories">
          {content.categories.map(({ label, description, query, icon: Icon }, index) => (
            <Link key={label} href={query} className={index === 0 ? 'is-featured' : ''}>
              <span className="sport-category__icon"><Icon size={index === 0 ? 32 : 25} strokeWidth={1.65} /></span>
              {index === 0 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="sport-category__visual"
                  src="/images/jersey-fallback.jpg"
                  width="460"
                  height="460"
                  alt=""
                />
              )}
              <span className="sport-category__copy">
                <strong>{label}</strong>
                <small>{description}</small>
              </span>
              <span className="sport-category__arrow"><ArrowRight size={17} /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
