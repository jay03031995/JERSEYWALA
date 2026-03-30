'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Heart, Search, Menu, X, User, ChevronDown, Sun, Moon } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'

const NAV = [
  { label: 'Shop All', href: '/shop' },
  {
    label: 'Sports', children: [
      { label: 'Football', href: '/sport/football' },
      { label: 'Cricket', href: '/sport/cricket' },
      { label: 'IPL 2026', href: '/sport/ipl' },
    ],
  },
  {
    label: 'IPL Teams', children: [
      { label: 'Chennai Super Kings', href: '/team/chennai-super-kings' },
      { label: 'Mumbai Indians', href: '/team/mumbai-indians' },
      { label: 'Royal Challengers Bengaluru', href: '/team/royal-challengers-bengaluru' },
      { label: 'Kolkata Knight Riders', href: '/team/kolkata-knight-riders' },
      { label: 'Delhi Capitals', href: '/team/delhi-capitals' },
      { label: 'Punjab Kings', href: '/team/punjab-kings' },
      { label: 'Rajasthan Royals', href: '/team/rajasthan-royals' },
      { label: 'Sunrisers Hyderabad', href: '/team/sunrisers-hyderabad' },
      { label: 'Gujarat Titans', href: '/team/gujarat-titans' },
      { label: 'Lucknow Super Giants', href: '/team/lucknow-super-giants' },
    ],
  },
  {
    label: 'Leagues', children: [
      { label: 'Premier League', href: '/league/premier-league' },
      { label: 'La Liga', href: '/league/la-liga' },
      { label: 'IPL 2026', href: '/league/ipl-2026' },
      { label: 'International Cricket', href: '/league/international-cricket' },
    ],
  },
  { label: 'New In', href: '/shop?new=true', accent: true },
  { label: 'Sale', href: '/shop?deals=true' },
]

function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  useEffect(() => {
    setTheme((document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark')
  }, [])
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
    setTheme(next)
  }
  return (
    <button onClick={toggle} className="p-2 rounded-lg hover:bg-[var(--bg-raised)] transition-colors text-[var(--fg-muted)] hover:text-[var(--fg)]">
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)

  const openCart = useCartStore((s) => s.openCart)
  const cartCount = useCartStore((s) => s.itemCount())
  const wishlistCount = useWishlistStore((s) => s.items.length)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <header
      className="sticky top-0 z-40 transition-all duration-200"
      style={{
        background: scrolled ? 'rgba(10,10,10,0.88)' : 'var(--bg)',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Ticker strip */}
      <div className="overflow-hidden" style={{ background: 'var(--red)', height: '30px' }}>
        <div className="flex items-center h-full animate-[marquee_30s_linear_infinite] whitespace-nowrap gap-12 px-4">
          {Array.from({ length: 4 }).flatMap((_, i) => [
            <span key={`${i}-a`} className="text-white text-[11px] font-semibold tracking-[0.08em] uppercase">Free delivery on orders above ₹999</span>,
            <span key={`${i}-b`} className="text-white/40 mx-4">·</span>,
            <span key={`${i}-c`} className="text-white text-[11px] font-semibold tracking-[0.08em] uppercase">Use code JERSEY10 for 10% off</span>,
            <span key={`${i}-d`} className="text-white/40 mx-4">·</span>,
            <span key={`${i}-e`} className="text-white text-[11px] font-semibold tracking-[0.08em] uppercase">IPL 2026 jerseys now available</span>,
            <span key={`${i}-f`} className="text-white/40 mx-4">·</span>,
          ])}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center h-14 gap-5">
        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center gap-2.5">
          <div
            className="w-8 h-8 flex items-center justify-center rounded-lg"
            style={{ background: 'var(--red)' }}
          >
            <span className="text-white text-[11px] font-bold tracking-widest uppercase">JW</span>
          </div>
          <span
            className="text-[15px] font-semibold tracking-tight hidden sm:block"
            style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}
          >
            The Jersey Wala
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-0.5 flex-1">
          {NAV.map((item) =>
            item.children ? (
              <div key={item.label} className="relative group">
                <button
                  className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium rounded-lg transition-colors"
                  style={{ color: 'var(--fg-muted)' }}
                >
                  {item.label} <ChevronDown size={11} />
                </button>
                <div
                  className={`absolute top-full left-0 mt-2 rounded-xl p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 translate-y-1 group-hover:translate-y-0 shadow-2xl ${item.label === 'IPL Teams' ? 'w-64' : 'w-48'}`}
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
                >
                  {item.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className="block px-3 py-2 rounded-lg text-[13px] transition-colors"
                      style={{ color: 'var(--fg-muted)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.background = 'var(--bg-card)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-muted)'; e.currentTarget.style.background = 'transparent' }}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href!}
                className="px-3 py-2 text-[13px] font-medium rounded-lg transition-colors"
                style={{ color: item.accent ? 'var(--red)' : 'var(--fg-muted)' }}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Spacer: pushes actions right when desktop nav is hidden */}
        <div className="flex-1 xl:hidden" />

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <ThemeToggle />

          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--fg-muted)' }}
          >
            <Search size={17} />
          </button>

          <Link href="/account/wishlist" className="relative p-2 rounded-lg transition-colors" style={{ color: 'var(--fg-muted)' }}>
            <Heart size={17} />
            {wishlistCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: 'var(--red)' }}>
                {wishlistCount}
              </span>
            )}
          </Link>

          <button onClick={openCart} className="relative p-2 rounded-lg transition-colors" style={{ color: 'var(--fg-muted)' }}>
            <ShoppingBag size={17} />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: 'var(--red)' }}>
                {cartCount}
              </span>
            )}
          </button>

          <Link href="/account" className="p-2 rounded-lg transition-colors" style={{ color: 'var(--fg-muted)' }}>
            <User size={17} />
          </Link>

          <button
            className="xl:hidden p-2 rounded-lg transition-colors ml-1"
            style={{ color: 'var(--fg-muted)' }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Search */}
      {searchOpen && (
        <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search jerseys, teams, players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim())
                  window.location.href = `/shop?q=${encodeURIComponent(searchQuery)}`
              }}
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl text-[14px] focus:outline-none transition"
              style={{
                background: 'var(--bg-raised)',
                color: 'var(--fg)',
                border: '1px solid var(--border)',
              }}
            />
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="xl:hidden px-4 py-3 space-y-1" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)', maxHeight: '70vh', overflowY: 'auto' }}>
          {NAV.map((item) =>
            item.children ? (
              <div key={item.label}>
                <p className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                  {item.label}
                </p>
                {item.children.map((c) => (
                  <Link key={c.href} href={c.href} className="block px-3 py-2 rounded-lg text-[13px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                    {c.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link key={item.href} href={item.href!} className="block px-3 py-2.5 rounded-lg text-[14px] font-medium" style={{ color: item.accent ? 'var(--red)' : 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
                {item.label}
              </Link>
            )
          )}
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </header>
  )
}
