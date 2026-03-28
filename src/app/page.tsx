import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, TrendingUp } from 'lucide-react'
import { getFeaturedProducts, getNewArrivals } from '@/lib/queries/products'
import ProductGrid from '@/components/product/ProductGrid'
import CountdownTimer from '@/components/ui/CountdownTimer'
import NewsletterForm from '@/components/ui/NewsletterForm'
import AdBanner from '@/components/ui/AdBanner'
import TeamPromoGrid from '@/components/ui/TeamPromoGrid'

export const revalidate = 60

// Real MI jersey images from shop.mumbaiindians.com Shopify CDN
const MI_HERO_IMAGE = 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TP0293ID__RNVL_B.jpg?v=1772786445'

const MI_TRENDING = [
  {
    name: 'Official Fan Jersey 2026 – Men',
    price: '₹999',
    image: 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TP0293ID__RNVL_B.jpg?v=1772786445',
    href: '/team/mumbai-indians',
    badge: 'Trending',
  },
  {
    name: 'Official Fan Jersey 2026 – Women',
    price: '₹849',
    image: 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TP0294ID__RNVL_A.jpg?v=1772786523',
    href: '/team/mumbai-indians',
    badge: 'New',
  },
  {
    name: 'Official Training Jersey 2026',
    price: '₹999',
    image: 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TS0448ID__RNVL_A.jpg?v=1772786195',
    href: '/team/mumbai-indians',
    badge: 'Pre-Order',
  },
  {
    name: 'Custom Replica Jersey 2026 – Men',
    price: '₹2,499',
    image: 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TP0297ID__RNVL_A.jpg?v=1772786160',
    href: '/team/mumbai-indians',
    badge: 'Best Seller',
  },
  {
    name: "Kid's Fan Jersey 2026",
    price: '₹799',
    image: 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TP0295ID__RNVL_F.jpg?v=1772702815',
    href: '/team/mumbai-indians',
    badge: 'New',
  },
  {
    name: 'WPL Fan Jersey 2026 – Women',
    price: '₹849',
    image: 'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TP0292ID-NWLB-A.jpg?v=1766993704',
    href: '/team/mumbai-indians',
    badge: 'WPL',
  },
]

const SPORTS = [
  {
    slug: 'football',
    label: 'Football',
    sub: 'Premier League · La Liga · UCL',
    count: '150+',
    accent: '#39FF14',
  },
  {
    slug: 'cricket',
    label: 'Cricket',
    sub: 'India · England · Australia',
    count: '120+',
    accent: '#F5C518',
  },
  {
    slug: 'ipl',
    label: 'IPL 2026',
    sub: 'All 10 Franchises',
    count: '100+',
    accent: '#00B4D8',
  },
]

const OFFER_END = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getFeaturedProducts>> = []
  let newArrivals: Awaited<ReturnType<typeof getNewArrivals>> = []

  try {
    ;[featured, newArrivals] = await Promise.all([
      getFeaturedProducts(8),
      getNewArrivals(4),
    ])
  } catch {
    // DB not yet connected
  }

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)' }}>

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute"
            style={{
              width: '60vw',
              height: '60vw',
              top: '-15%',
              right: '-10%',
              background: 'radial-gradient(circle, rgba(232,25,44,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
          <div
            className="absolute"
            style={{
              width: '30vw',
              height: '30vw',
              bottom: '-5%',
              left: '5%',
              background: 'radial-gradient(circle, rgba(57,255,20,0.04) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
          {/* MI blue glow behind jersey */}
          <div
            className="absolute hidden lg:block"
            style={{
              width: '40vw',
              height: '80vh',
              top: '0',
              right: '0',
              background: 'radial-gradient(ellipse at right, rgba(0,75,160,0.18) 0%, transparent 65%)',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full relative z-10 py-20">
          <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-center">

            {/* Left: Text */}
            <div>
              <p
                className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-6"
                style={{ color: 'var(--red)', fontFamily: 'var(--font-inter)' }}
              >
                New Season · 2026 Collection
              </p>
              <h1
                className="font-bold uppercase leading-[0.9] mb-7"
                style={{
                  fontSize: 'clamp(52px, 9vw, 108px)',
                  letterSpacing: '-0.03em',
                  fontFamily: 'var(--font-oswald)',
                }}
              >
                Built For Fans.<br />
                <span style={{ color: 'var(--red)' }}>Worn By Legends.</span>
              </h1>
              <p
                className="text-[17px] leading-relaxed mb-9 max-w-lg font-light"
                style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
              >
                Official and replica jerseys for cricket, football, and IPL.
                Every size, every team — delivered fast across India.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[14px] font-semibold transition-all hover:opacity-90"
                  style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
                >
                  Explore Collection <ArrowRight size={14} />
                </Link>
                <Link
                  href="/sport/ipl"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[14px] font-medium transition-all"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--fg)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  IPL 2026 Jerseys
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-10 mt-14 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
                {[
                  { n: '500+', l: 'Jerseys', color: 'var(--green)' },
                  { n: '50+', l: 'Teams', color: 'var(--gold)' },
                  { n: '10k+', l: 'Delivered', color: 'var(--blue)' },
                ].map(({ n, l, color }) => (
                  <div key={l}>
                    <div className="text-[28px] font-bold" style={{ fontFamily: 'var(--font-oswald)', color }}>
                      {n}
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.08em] mt-0.5" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                      {l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Real MI Jersey Image */}
            <div className="hidden lg:flex justify-center items-center relative">
              <div className="relative">
                {/* Blue glow behind image */}
                <div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(0,75,160,0.35) 0%, transparent 70%)',
                    transform: 'scale(1.15)',
                    filter: 'blur(30px)',
                  }}
                />
                <div
                  className="relative w-[380px] h-[500px] rounded-3xl overflow-hidden"
                  style={{
                    border: '1px solid rgba(0,75,160,0.3)',
                    boxShadow: '0 0 60px rgba(0,75,160,0.25)',
                  }}
                >
                  <Image
                    src={MI_HERO_IMAGE}
                    alt="Mumbai Indians Official Fan Jersey 2026"
                    fill
                    className="object-cover"
                    priority
                    sizes="420px"
                  />
                  {/* Gradient overlay bottom */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-32"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
                  />
                  {/* Trending badge */}
                  <div
                    className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
                    style={{ background: 'var(--green)', color: '#000', fontFamily: 'var(--font-inter)' }}
                  >
                    <TrendingUp size={11} />
                    #TRENDING · IPL 2026
                  </div>
                  {/* Product label */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-[13px] font-semibold" style={{ fontFamily: 'var(--font-inter)' }}>
                      MI Official Fan Jersey 2026
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '11px', fontFamily: 'var(--font-inter)' }}>
                      Starting ₹999 · Pre-Order Now
                    </p>
                  </div>
                </div>
                {/* New 2026 badge */}
                <div
                  className="absolute -top-3 -right-3 text-[12px] font-bold px-3 py-1.5 rounded-full"
                  style={{ background: '#F5C518', color: '#002E6B', fontFamily: 'var(--font-inter)' }}
                >
                  New 2026
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Editorial label */}
        <div className="absolute right-8 bottom-10 hidden xl:flex flex-col items-center gap-2">
          <div className="w-px h-16" style={{ background: 'var(--border)' }} />
          <p
            className="text-[10px] tracking-[0.2em] uppercase"
            style={{ color: 'var(--fg-sub)', writingMode: 'vertical-rl', fontFamily: 'var(--font-inter)' }}
          >
            The Jersey Wala · Est. 2025
          </p>
        </div>
      </section>

      {/* ── TRENDING NOW ── */}
      <section style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(57,255,20,0.08)', color: 'var(--green)', border: '1px solid rgba(57,255,20,0.15)', fontFamily: 'var(--font-inter)' }}
              >
                <TrendingUp size={11} />
                Trending Now
              </div>
              <span
                className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,75,160,0.15)', color: '#60A5FA', fontFamily: 'var(--font-inter)' }}
              >
                IPL 2026
              </span>
            </div>
            <Link
              href="/team/mumbai-indians"
              className="flex items-center gap-1 text-[13px] font-medium"
              style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
            >
              All MI Jerseys <ArrowRight size={13} />
            </Link>
          </div>

          {/* Horizontal scroll row */}
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {MI_TRENDING.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex-shrink-0 w-44 rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    sizes="176px"
                  />
                  <div
                    className="absolute top-2 left-2 text-[9px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--green)', color: '#000', fontFamily: 'var(--font-inter)' }}
                  >
                    {item.badge}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[12px] font-medium leading-snug line-clamp-2" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
                    {item.name}
                  </p>
                  <p className="text-[13px] font-bold mt-1.5" style={{ color: 'var(--fg)', fontFamily: 'var(--font-oswald)' }}>
                    {item.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPORTS CATEGORIES ── */}
      <section style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-2" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                Browse by Sport
              </p>
              <h2 className="text-[40px] font-bold uppercase" style={{ fontFamily: 'var(--font-oswald)', letterSpacing: '-0.02em' }}>
                Shop Your Sport
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SPORTS.map((sport) => (
              <Link
                key={sport.slug}
                href={`/sport/${sport.slug}`}
                className="group relative rounded-2xl p-7 flex flex-col justify-between overflow-hidden transition-all hover:scale-[1.01]"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  minHeight: '200px',
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-3"
                      style={{ color: sport.accent, fontFamily: 'var(--font-inter)' }}
                    >
                      {sport.count} Jerseys
                    </p>
                    <h3
                      className="text-[32px] font-bold uppercase leading-none mb-2"
                      style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
                    >
                      {sport.label}
                    </h3>
                    <p className="text-[13px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                      {sport.sub}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{ color: 'var(--fg-sub)' }}
                  />
                </div>

                {/* Accent glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at top left, ${sport.accent}08, transparent 70%)` }}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED JERSEYS ── */}
      <section style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-2" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                Handpicked
              </p>
              <h2 className="text-[40px] font-bold uppercase" style={{ fontFamily: 'var(--font-oswald)', letterSpacing: '-0.02em' }}>
                Featured Jerseys
              </h2>
            </div>
            <Link
              href="/shop"
              className="flex items-center gap-1.5 text-[13px] font-medium transition-colors"
              style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <ProductGrid products={featured} />
        </div>
      </section>

      {/* ── AD BANNER 1 ── */}
      <AdBanner slot="1234567890" format="horizontal" />

      {/* ── MI PROMO BLOCK ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #002E6B 0%, #004BA0 50%, #003880 100%)',
          borderTop: '1px solid var(--border)',
        }}
      >
        {/* MI Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="text-[200px] font-bold text-white absolute -right-8 -top-8 leading-none" style={{ fontFamily: 'var(--font-oswald)' }}>
            MI
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div
                className="inline-block text-[11px] font-semibold tracking-[0.1em] uppercase px-3 py-1 rounded-full mb-5"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'var(--font-inter)' }}
              >
                Official · IPL 2026
              </div>
              <h2
                className="text-[52px] font-bold uppercase leading-tight mb-3"
                style={{ fontFamily: 'var(--font-oswald)', color: '#fff', letterSpacing: '-0.02em' }}
              >
                Mumbai Indians<br />
                <span style={{ color: '#F5C518' }}>2026 Jersey.</span>
              </h2>
              <p className="text-[16px] font-light mb-6" style={{ color: 'rgba(255,255,255,0.82)', fontFamily: 'var(--font-inter)' }}>
                From Fan Edition to Player Replica. Official MI kits for IPL 2026 — Fan, Training, and Custom editions available. Pre-order now.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Fan Edition', price: '₹999' },
                  { label: 'Replica', price: '₹2,499' },
                  { label: 'Training', price: '₹999' },
                ].map((p) => (
                  <div key={p.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="text-[18px] font-bold text-white" style={{ fontFamily: 'var(--font-oswald)' }}>{p.price}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-inter)' }}>{p.label}</div>
                  </div>
                ))}
              </div>

              <Link
                href="/team/mumbai-indians"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[14px] font-semibold transition-all hover:opacity-90"
                style={{ background: '#F5C518', color: '#002E6B', fontFamily: 'var(--font-inter)' }}
              >
                Shop MI Jerseys <ArrowRight size={14} />
              </Link>
            </div>

            {/* Real MI Jersey Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div
                  className="w-64 h-80 rounded-2xl overflow-hidden relative"
                  style={{
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 0 80px rgba(0,75,160,0.5)',
                  }}
                >
                  <Image
                    src="https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TP0297ID__RNVL_A.jpg?v=1772786160"
                    alt="MI Official Custom Replica Jersey 2026"
                    fill
                    className="object-cover"
                    sizes="256px"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-20"
                    style={{ background: 'linear-gradient(to top, rgba(0,20,60,0.9), transparent)' }}
                  />
                  <p className="absolute bottom-3 left-3 right-3 text-white text-[11px] font-medium" style={{ fontFamily: 'var(--font-inter)' }}>
                    Custom Replica · ₹2,499
                  </p>
                </div>
                <div
                  className="absolute -top-2 -right-2 text-[12px] font-bold px-3 py-1.5 rounded-full"
                  style={{ background: '#F5C518', color: '#002E6B', fontFamily: 'var(--font-inter)' }}
                >
                  New 2026
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AD BANNER 2 ── */}
      <AdBanner slot="0987654321" format="horizontal" />

      {/* ── TEAM PROMO GRID ── */}
      <TeamPromoGrid />

      {/* ── PROMO OFFER ── */}
      <section
        className="relative"
        style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div
                className="inline-block text-[11px] font-semibold tracking-[0.1em] uppercase px-3 py-1 rounded-full mb-5"
                style={{ background: 'rgba(232,25,44,0.1)', color: 'var(--red)', border: '1px solid rgba(232,25,44,0.15)', fontFamily: 'var(--font-inter)' }}
              >
                Limited Time Offer
              </div>
              <h2
                className="text-[44px] font-bold uppercase leading-tight mb-3"
                style={{ fontFamily: 'var(--font-oswald)', letterSpacing: '-0.02em' }}
              >
                20% Off All<br />
                <span style={{ color: 'var(--red)' }}>Cricket Jerseys.</span>
              </h2>
              <p className="text-[15px] mb-6 font-light" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                World Cup Special — India, England, Australia & more. Offer ends soon.
              </p>
              <div className="mb-7">
                <p className="text-[11px] uppercase tracking-[0.08em] font-medium mb-3" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                  Offer ends in
                </p>
                <CountdownTimer targetDate={OFFER_END} />
              </div>
              <Link
                href="/sport/cricket"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[14px] font-semibold transition-all hover:opacity-90"
                style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
              >
                Shop Cricket <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'KOHLI', no: '18', team: 'India' },
                { name: 'ROHIT', no: '45', team: 'India' },
                { name: 'BUMRAH', no: '93', team: 'India' },
                { name: 'DHONI', no: '7', team: 'India' },
              ].map((p) => (
                <div
                  key={p.name}
                  className="rounded-xl p-4 flex flex-col"
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
                >
                  <div className="text-[32px] font-bold leading-none opacity-10" style={{ fontFamily: 'var(--font-oswald)' }}>
                    {p.no}
                  </div>
                  <div className="mt-auto">
                    <div className="text-[20px] font-bold" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>{p.name}</div>
                    <div className="text-[11px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>{p.team}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      {newArrivals.length > 0 && (
        <section style={{ borderTop: '1px solid var(--border)' }}>
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-2" style={{ color: 'var(--green)', fontFamily: 'var(--font-inter)' }}>
                  Just Dropped
                </p>
                <h2 className="text-[40px] font-bold uppercase" style={{ fontFamily: 'var(--font-oswald)', letterSpacing: '-0.02em' }}>
                  New In
                </h2>
              </div>
              <Link href="/shop?new=true" className="text-[13px] font-medium flex items-center gap-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                View all <ArrowRight size={13} />
              </Link>
            </div>
            <ProductGrid products={newArrivals} />
          </div>
        </section>
      )}

      {/* ── REVIEWS ── */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
          <div className="mb-10">
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-2" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
              Fan Reviews
            </p>
            <h2 className="text-[40px] font-bold uppercase" style={{ fontFamily: 'var(--font-oswald)', letterSpacing: '-0.02em' }}>
              What Fans Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Rahul K.', city: 'Mumbai', rating: 5, text: 'Got the India cricket jersey in just 2 days. Quality is exactly as expected.' },
              { name: 'Priya S.', city: 'Delhi', rating: 5, text: 'The Real Madrid jersey is identical to the official one. Incredible for the price.' },
              { name: 'Arjun M.', city: 'Bangalore', rating: 4, text: 'Fast delivery, solid packaging. The CSK jersey fits perfectly.' },
            ].map((r) => (
              <div
                key={r.name}
                className="rounded-2xl p-6"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--gold)' }} />
                  ))}
                </div>
                <p className="text-[14px] leading-relaxed mb-4" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                  &ldquo;{r.text}&rdquo;
                </p>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: 'var(--border)', color: 'var(--fg)' }}
                  >
                    {r.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>{r.name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>{r.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AD BANNER 3 ── */}
      <AdBanner slot="1122334455" format="auto" />

      {/* ── NEWSLETTER ── */}
      <section style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-xl mx-auto px-5 py-20 text-center">
          <h2 className="text-[40px] font-bold uppercase mb-2" style={{ fontFamily: 'var(--font-oswald)', letterSpacing: '-0.02em' }}>
            Stay in the Loop
          </h2>
          <p className="text-[15px] mb-8 font-light" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
            New drops, exclusive deals, and team updates — straight to your inbox.
          </p>
          <NewsletterForm />
          <p className="text-[11px] mt-3" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>

    </div>
  )
}
