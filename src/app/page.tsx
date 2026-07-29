import {
  getFeaturedProducts,
  getNewArrivals,
  getSaleProducts,
  getSignatureProducts,
  getBestSellers,
  getProducts,
} from '@/lib/queries/products'
import { getSports } from '@/lib/queries/teams'
import { getBanners } from '@/lib/queries/banners'
import { getApprovedReviews } from '@/lib/queries/reviews'
import { getStoreContent } from '@/lib/store-content'
import type { Product } from '@/types/database'

import HomePopup from '@/components/banners/HomePopup'
import HeroSlider from '@/components/home/HeroSlider'
import ShopByCollection, { type CollectionTile } from '@/components/home/ShopByCollection'
import ProductSection from '@/components/home/ProductSection'
import CustomizeJersey from '@/components/home/CustomizeJersey'
import WhyChoose from '@/components/home/WhyChoose'
import ReviewsCarousel from '@/components/home/ReviewsCarousel'
import InstagramGallery from '@/components/home/InstagramGallery'
import WhatsAppCommunity from '@/components/home/WhatsAppCommunity'
import NewsletterForm from '@/components/ui/NewsletterForm'
import SportShopToggle from '@/components/home/SportShopToggle'

export const revalidate = 30

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p
  } catch {
    return fallback
  }
}

const imgOf = (p?: Product): string | undefined =>
  p?.images?.find((i) => i.is_primary)?.url ?? p?.images?.[0]?.url ?? undefined

export default async function HomePage() {
  const [
    heroBanners,
    igPosts,
    sports,
    featured,
    newArrivals,
    sale,
    signature,
    bestSellers,
    reviews,
    content,
    pool,
  ] = await Promise.all([
    safe(getBanners('homepage_hero'), []),
    safe(getBanners('instagram'), []),
    safe(getSports(), [] as Awaited<ReturnType<typeof getSports>>),
    safe(getFeaturedProducts(8), [] as Product[]),
    safe(getNewArrivals(8), [] as Product[]),
    safe(getSaleProducts(8), [] as Product[]),
    safe(getSignatureProducts(8), [] as Product[]),
    safe(getBestSellers(8), [] as Product[]),
    safe(getApprovedReviews(9), []),
    getStoreContent(),
    safe(getProducts({ limit: 48 }), [] as Product[]),
  ])

  // ── Build "Shop by Collection" tiles from real data ──
  const findBySport = (slug: string) => pool.find((p) => p.team?.league?.sport?.slug === slug)
  const findByLeague = (slug: string) => pool.find((p) => p.team?.league?.slug === slug)

  const tiles: CollectionTile[] = []
  for (const s of sports ?? []) {
    const img = imgOf(findBySport(s.slug)) ?? s.icon_url
    if (img) tiles.push({ label: s.name, href: `/sport/${s.slug}`, image: img })
  }
  const iplImg = imgOf(findByLeague('ipl-2026'))
  if (iplImg && !tiles.some((t) => t.href === '/sport/ipl')) {
    tiles.push({ label: 'IPL 2026', href: '/sport/ipl', image: iplImg })
  }
  const naImg = imgOf(newArrivals[0])
  if (naImg) tiles.push({ label: 'New Arrivals', href: '/shop?new=true', image: naImg })
  const saleImg = imgOf(sale[0])
  if (saleImg) tiles.push({ label: 'Special Offers', href: '/shop?deals=true', image: saleImg })
  const legendImg = imgOf(signature[0])
  if (legendImg) tiles.push({ label: 'Worn by Legends', href: '#legends', image: legendImg })
  const customImg = imgOf(featured[0]) ?? imgOf(pool[0])
  if (customImg) tiles.push({ label: 'Customize', href: '#customize', image: customImg })

  // Products offered in the customizer — prefer named-player jerseys, then featured
  const customizePool = (signature.length > 0 ? signature : featured.length > 0 ? featured : pool).slice(0, 10)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <HomePopup />

      <HeroSlider banners={heroBanners} />

      <SportShopToggle />

      <ShopByCollection tiles={tiles} />

      <ProductSection
        eyebrow="Fresh off the pitch"
        title="New drops"
        ctaHref="/shop?new=true"
        products={newArrivals}
        tinted
      />

      <ProductSection
        id="legends"
        eyebrow="Player editions"
        title="Wear your hero"
        ctaHref="/shop"
        products={signature}
      />

      <CustomizeJersey products={customizePool} />

      <WhyChoose
        freeShippingThreshold={content.free_shipping_threshold}
        returnDays={content.return_policy_days}
      />

      <ProductSection
        eyebrow="Crowd approved"
        title="Fan favourites"
        ctaHref="/shop"
        products={bestSellers}
        tinted
      />

      <ProductSection
        eyebrow="The starting XI"
        title="Jerseywala picks"
        ctaHref="/shop"
        products={featured}
      />

      <ProductSection
        eyebrow="Limited time"
        title="Red hot deals"
        ctaHref="/shop?deals=true"
        products={sale}
        tinted
      />

      <ReviewsCarousel reviews={reviews} />

      <InstagramGallery posts={igPosts} instagramUrl={content.instagram_url} />

      <WhatsAppCommunity whatsapp={content.whatsapp_number} />

      {/* Newsletter */}
      <section style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="max-w-xl mx-auto px-5 py-16 sm:py-20 text-center">
          <h2
            className="text-[32px] sm:text-[40px] font-bold uppercase mb-2 leading-none"
            style={{ fontFamily: 'var(--font-oswald)', letterSpacing: '-0.02em', color: 'var(--fg)' }}
          >
            Stay in the Loop
          </h2>
          <p className="text-[15px] mb-8" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
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
