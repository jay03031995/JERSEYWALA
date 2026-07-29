'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { HomeBanner } from '@/lib/queries/banners'
import { useSportPreference } from '@/components/sport/SportPreference'

const COPY = {
  football: {
    kicker: 'Football store',
    title: 'Wear the badge. Live the game.',
    subtitle: 'Club and country jerseys, keychains, trophies and football accessories for every match day.',
    cta: 'Shop football',
    href: '/sport/football',
  },
  cricket: {
    kicker: 'Cricket store',
    title: 'Every innings starts here.',
    subtitle: 'India and IPL jerseys, cricket keychains, trophies and tackle made for true fans.',
    cta: 'Shop cricket',
    href: '/sport/cricket',
  },
}

function bannerMatchesSport(banner: HomeBanner, sport: 'football' | 'cricket') {
  const text = `${banner.title} ${banner.subtitle ?? ''} ${banner.cta_link ?? ''}`.toLowerCase()
  return sport === 'cricket'
    ? text.includes('cricket') || text.includes('ipl')
    : text.includes('football')
}

export default function HeroSlider({
  banners,
}: {
  banners: HomeBanner[]
}) {
  const { sport } = useSportPreference()
  const copy = COPY[sport]
  const matchingBanner = banners.find((banner) => bannerMatchesSport(banner, sport))
  const image = sport === 'football'
    ? '/heroes/football-world-final.webp'
    : '/heroes/cricket-lords-scene.webp'

  return (
    <section className="sport-hero" data-sport={sport}>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="sport-hero__image" />
      )}
      <div className="sport-hero__shade" />
      <div className="sport-hero__content">
        <p>{copy.kicker}</p>
        <h1>{matchingBanner?.title ?? copy.title}</h1>
        <div className="sport-hero__footer">
          <span>{matchingBanner?.subtitle ?? copy.subtitle}</span>
          <Link href={matchingBanner?.cta_link ?? copy.href}>
            {matchingBanner?.cta_text ?? copy.cta}
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
      <div className="sport-hero__label" aria-hidden="true">
        {sport === 'football' ? 'FOOTBALL' : 'CRICKET'}
      </div>
    </section>
  )
}
