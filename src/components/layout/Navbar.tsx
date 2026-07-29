'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { HeaderSportToggle } from '@/components/sport/SportPreference'

type MegaLink = { label: string; href: string; description?: string }
type NavItem = {
  label: string
  href?: string
  accent?: boolean
  columns?: { title: string; links: MegaLink[] }[]
}

const NAV: NavItem[] = [
  { label: 'New Drops', href: '/shop?new=true', accent: true },
  {
    label: 'Football',
    columns: [
      {
        title: 'Shop Football',
        links: [
          { label: 'All Football', href: '/sport/football', description: 'Every club, country and collection' },
          { label: 'New Jerseys', href: '/shop?sport=football&category=jersey&new=true', description: 'The latest season drops' },
          { label: 'Retro Jerseys', href: '/shop?sport=football&q=retro', description: 'Icons from unforgettable eras' },
        ],
      },
      {
        title: 'Fan Essentials',
        links: [
          { label: 'Keychains', href: '/shop?sport=football&category=keychain' },
          { label: 'Trophies', href: '/shop?sport=football&category=trophy' },
          { label: 'Match Tackle', href: '/shop?sport=football&category=tackle' },
        ],
      },
      {
        title: 'Popular Leagues',
        links: [
          { label: 'Premier League', href: '/league/premier-league' },
          { label: 'La Liga', href: '/league/la-liga' },
          { label: 'International', href: '/shop?sport=football&q=international' },
        ],
      },
    ],
  },
  {
    label: 'Cricket',
    columns: [
      {
        title: 'Shop Cricket',
        links: [
          { label: 'All Cricket', href: '/sport/cricket', description: 'India, IPL and international teams' },
          { label: 'New Jerseys', href: '/shop?sport=cricket&category=jersey&new=true', description: 'Fresh arrivals for this season' },
          { label: 'India Jerseys', href: '/shop?sport=cricket&q=india', description: 'Wear the blue with pride' },
        ],
      },
      {
        title: 'Fan Essentials',
        links: [
          { label: 'Keychains', href: '/shop?sport=cricket&category=keychain' },
          { label: 'Trophies', href: '/shop?sport=cricket&category=trophy' },
          { label: 'Cricket Tackle', href: '/shop?sport=cricket&category=tackle' },
        ],
      },
      {
        title: 'Popular',
        links: [
          { label: 'IPL 2026', href: '/sport/ipl' },
          { label: 'International Cricket', href: '/league/international-cricket' },
          { label: 'Player Editions', href: '/shop?sport=cricket&q=player' },
        ],
      },
    ],
  },
  {
    label: 'Sports',
    columns: [
      {
        title: 'Choose Your Game',
        links: [
          { label: 'Football', href: '/sport/football', description: 'Club and country fanwear' },
          { label: 'Cricket', href: '/sport/cricket', description: 'India and international jerseys' },
          { label: 'IPL', href: '/sport/ipl', description: 'Every franchise, every fan' },
        ],
      },
      {
        title: 'Shop By Need',
        links: [
          { label: 'Jerseys', href: '/shop?category=jersey' },
          { label: 'Collectibles', href: '/shop?category=keychain' },
          { label: 'Accessories', href: '/shop?category=tackle' },
        ],
      },
    ],
  },
  {
    label: 'IPL Teams',
    columns: [
      {
        title: 'Fan Favourites',
        links: [
          { label: 'Chennai Super Kings', href: '/team/chennai-super-kings' },
          { label: 'Mumbai Indians', href: '/team/mumbai-indians' },
          { label: 'Royal Challengers Bengaluru', href: '/team/royal-challengers-bengaluru' },
          { label: 'Kolkata Knight Riders', href: '/team/kolkata-knight-riders' },
        ],
      },
      {
        title: 'More Teams',
        links: [
          { label: 'Delhi Capitals', href: '/team/delhi-capitals' },
          { label: 'Punjab Kings', href: '/team/punjab-kings' },
          { label: 'Rajasthan Royals', href: '/team/rajasthan-royals' },
        ],
      },
      {
        title: 'More Teams',
        links: [
          { label: 'Sunrisers Hyderabad', href: '/team/sunrisers-hyderabad' },
          { label: 'Gujarat Titans', href: '/team/gujarat-titans' },
          { label: 'Lucknow Super Giants', href: '/team/lucknow-super-giants' },
        ],
      },
    ],
  },
  {
    label: 'Leagues',
    columns: [
      {
        title: 'Football',
        links: [
          { label: 'Premier League', href: '/league/premier-league' },
          { label: 'La Liga', href: '/league/la-liga' },
          { label: 'International Football', href: '/shop?sport=football&q=international' },
        ],
      },
      {
        title: 'Cricket',
        links: [
          { label: 'IPL 2026', href: '/league/ipl-2026' },
          { label: 'International Cricket', href: '/league/international-cricket' },
          { label: 'India', href: '/shop?sport=cricket&q=india' },
        ],
      },
    ],
  },
  { label: 'Sale', href: '/shop?deals=true' },
]

const DEFAULT_TICKER = [
  'Free delivery on orders above ₹999',
  'Use code JERSEY10 for 10% off',
  'Fresh football and cricket drops available now',
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [tickerMessages, setTickerMessages] = useState(DEFAULT_TICKER)
  const openCart = useCartStore((state) => state.openCart)
  const cartCount = useCartStore((state) => state.itemCount())
  const wishlistCount = useWishlistStore((state) => state.items.length)

  useEffect(() => {
    fetch('/api/store-content')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (Array.isArray(data?.ticker_messages) && data.ticker_messages.length > 0) {
          setTickerMessages(data.ticker_messages)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

  const submitSearch = () => {
    if (searchQuery.trim()) window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`
  }

  return (
    <header className={`premium-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="premium-header__ticker">
        <div className="premium-header__ticker-track">
          {Array.from({ length: 3 }).flatMap((_, repeatIndex) =>
            tickerMessages.map((message, messageIndex) => (
              <span key={`${repeatIndex}-${messageIndex}`}>
                {message}<i aria-hidden="true">•</i>
              </span>
            )),
          )}
        </div>
      </div>

      <div className="premium-header__utility">
        <div className="premium-header__utility-inner">
          <button
            className="premium-header__mobile-menu"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link href="/" className="premium-brand" aria-label="The Jersey Wala home">
            <span className="premium-brand__mark">JW</span>
            <span className="premium-brand__name">The Jersey Wala</span>
          </Link>

          <div className="premium-header__trust">
            <span>Official fanwear destination</span>
            <span>Easy 7-day returns</span>
          </div>

          <div className="premium-header__actions">
            <button type="button" onClick={() => setSearchOpen((open) => !open)} aria-label="Search">
              <Search size={19} />
            </button>
            <Link href="/account/wishlist" className="desktop-action" aria-label="Wishlist">
              <Heart size={19} />
              {wishlistCount > 0 && <b>{wishlistCount}</b>}
            </Link>
            <button type="button" onClick={openCart} aria-label="Shopping bag">
              <ShoppingBag size={19} />
              {cartCount > 0 && <b>{cartCount}</b>}
            </button>
            <Link href="/account" className="desktop-action" aria-label="Account">
              <User size={19} />
            </Link>
          </div>
        </div>
      </div>

      <div className="premium-header__nav-row">
        <div className="premium-header__nav-inner">
          <nav className="premium-nav" aria-label="Main navigation">
            {NAV.map((item) => (
              <div key={item.label} className="premium-nav__item">
                {item.columns ? (
                  <>
                    <button type="button" className={item.accent ? 'is-accent' : ''}>
                      {item.label}<ChevronDown size={13} />
                    </button>
                    <div className="premium-mega">
                      <div className="premium-mega__inner">
                        <div className="premium-mega__intro">
                          <span>Explore</span>
                          <strong>{item.label}</strong>
                          <p>Curated jerseys and fan essentials, selected for the people who live the game.</p>
                        </div>
                        {item.columns.map((column) => (
                          <div key={column.title} className="premium-mega__column">
                            <h3>{column.title}</h3>
                            {column.links.map((link) => (
                              <Link key={link.href + link.label} href={link.href}>
                                <span>{link.label}</span>
                                {link.description && <small>{link.description}</small>}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link href={item.href!} className={item.accent ? 'is-accent' : ''}>
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
          <HeaderSportToggle />
        </div>
      </div>

      {searchOpen && (
        <div className="premium-search">
          <div>
            <Search size={18} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && submitSearch()}
              placeholder="Search jerseys, teams and collections"
              autoFocus
            />
            <button type="button" onClick={submitSearch}>Search</button>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="premium-mobile-menu">
          <HeaderSportToggle />
          {NAV.map((item) => (
            <div key={item.label} className="premium-mobile-menu__group">
              {item.href && (
                <Link href={item.href} className={item.accent ? 'is-accent' : ''}>
                  {item.label}
                </Link>
              )}
              {item.columns && (
                <>
                  <strong>{item.label}</strong>
                  <div>
                    {item.columns.flatMap((column) => column.links).slice(0, 8).map((link) => (
                      <Link key={link.href + link.label} href={link.href}>{link.label}</Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  )
}
