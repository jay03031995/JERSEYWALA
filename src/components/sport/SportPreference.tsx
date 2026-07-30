'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Product } from '@/types/database'

export type StoreSport = 'football' | 'cricket'

type SportPreferenceValue = {
  sport: StoreSport
  setSport: (sport: StoreSport) => void
}

const SportPreferenceContext = createContext<SportPreferenceValue | null>(null)

export function SportPreferenceProvider({ children }: { children: React.ReactNode }) {
  const [sport, setSportState] = useState<StoreSport>('football')

  useEffect(() => {
    const saved = window.localStorage.getItem('jerseywala-sport')
    if (saved === 'football' || saved === 'cricket') setSportState(saved)
  }, [])

  const value = useMemo(() => ({
    sport,
    setSport: (next: StoreSport) => {
      setSportState(next)
      window.localStorage.setItem('jerseywala-sport', next)
    },
  }), [sport])

  return (
    <SportPreferenceContext.Provider value={value}>
      {children}
    </SportPreferenceContext.Provider>
  )
}

export function useSportPreference() {
  const value = useContext(SportPreferenceContext)
  if (!value) throw new Error('useSportPreference must be used inside SportPreferenceProvider')
  return value
}

export function productMatchesSport(product: Product, sport: StoreSport) {
  const slug = product.team?.league?.sport?.slug?.toLowerCase()
  const tags = (product.tags ?? []).map((tag) => tag.toLowerCase())
  const searchable = [
    product.name,
    product.description,
    product.team?.name,
    product.team?.league?.name,
    ...tags,
  ].filter(Boolean).join(' ').toLowerCase()

  const isCricket =
    slug === 'cricket' ||
    slug === 'ipl' ||
    /\b(cricket|ipl|t20|odi|test match|bcci|csk|rcb|mi jersey|kkr|srh|dc jersey|rr jersey|pbks|gt jersey|lsg)\b/.test(searchable)

  const isFootball =
    slug === 'football' ||
    /\b(football|soccer|fifa|premier league|la liga|serie a|bundesliga|champions league|world cup|fc |united|madrid|barcelona|argentina|portugal|france|brazil)\b/.test(searchable)

  if (sport === 'cricket') return isCricket
  // Most legacy imports are football jerseys without a complete sport
  // relation. Keep those visible in the default store instead of rendering
  // an empty homepage, while cricket-classified items remain isolated.
  return isFootball || !isCricket
}

export function HeaderSportToggle() {
  const { sport, setSport } = useSportPreference()

  return (
    <div className="header-sport-toggle" role="group" aria-label="Choose store sport">
      {(['football', 'cricket'] as StoreSport[]).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setSport(item)}
          className={sport === item ? 'is-active' : ''}
          aria-pressed={sport === item}
        >
          {item}
        </button>
      ))}
    </div>
  )
}
