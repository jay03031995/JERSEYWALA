import {
  getFeaturedProducts,
  getNewArrivals,
  getSignatureProducts,
  getBestSellers,
  getProducts,
} from '@/lib/queries/products'
import { getSports } from '@/lib/queries/teams'
import { getStoreContent } from '@/lib/store-content'
import type { Product } from '@/types/database'

import ShopByCollection, { type CollectionTile } from '@/components/home/ShopByCollection'
import ProductSection from '@/components/home/ProductSection'
import CustomizeJersey from '@/components/home/CustomizeJersey'
import WhyChoose from '@/components/home/WhyChoose'
import NewsletterForm from '@/components/ui/NewsletterForm'
import SportShopToggle from '@/components/home/SportShopToggle'
import HomeCollectionPair from '@/components/home/HomeCollectionPair'

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
    sports,
    featured,
    newArrivals,
    signature,
    bestSellers,
    content,
    pool,
  ] = await Promise.all([
    safe(getSports(), [] as Awaited<ReturnType<typeof getSports>>),
    safe(getFeaturedProducts(8), [] as Product[]),
    safe(getNewArrivals(8), [] as Product[]),
    safe(getSignatureProducts(8), [] as Product[]),
    safe(getBestSellers(8), [] as Product[]),
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
  const legendImg = imgOf(signature[0])
  if (legendImg) tiles.push({ label: 'Worn by Legends', href: '#legends', image: legendImg })
  const customImg = imgOf(featured[0]) ?? imgOf(pool[0])
  if (customImg) tiles.push({ label: 'Customize', href: '#customize', image: customImg })

  // Products offered in the customizer — prefer named-player jerseys, then featured
  const customizePool = (signature.length > 0 ? signature : featured.length > 0 ? featured : pool).slice(0, 10)

  return (
    <div className="home-page">
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

      <SportShopToggle products={pool} />

      <CustomizeJersey products={customizePool} />

      <WhyChoose
        freeShippingThreshold={content.free_shipping_threshold}
        returnDays={content.return_policy_days}
      />

      <HomeCollectionPair bestSellers={bestSellers} featured={featured} />

      {/* Newsletter */}
      <section className="home-newsletter">
        <div className="site-container">
          <div className="home-newsletter__inner">
            <div>
              <p className="eyebrow">Stay connected</p>
              <h2>Stay in the Loop</h2>
              <span>New drops, exclusive deals and match-day stories—straight to your inbox.</span>
            </div>
            <div className="home-newsletter__form">
              <NewsletterForm />
              <small>No spam. Unsubscribe anytime.</small>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
