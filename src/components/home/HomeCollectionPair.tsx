'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'
import { productMatchesSport, useSportPreference } from '@/components/sport/SportPreference'
import type { Product } from '@/types/database'

function Collection({
  eyebrow,
  title,
  products,
}: {
  eyebrow: string
  title: string
  products: Product[]
}) {
  if (products.length === 0) return null
  return (
    <section className="home-pair__collection">
      <div className="home-pair__heading">
        <div>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <Link href="/shop">View all <ArrowRight size={13} /></Link>
      </div>
      <div className="home-pair__grid">
        {products.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  )
}

export default function HomeCollectionPair({
  bestSellers,
  featured,
}: {
  bestSellers: Product[]
  featured: Product[]
}) {
  const { sport } = useSportPreference()
  const filter = (products: Product[]) => products.filter((product) => productMatchesSport(product, sport))

  return (
    <div className="home-pair">
      <Collection eyebrow="Fans approved" title="Fan Favourites" products={filter(bestSellers)} />
      <Collection eyebrow="The Jerseywala picks" title="Jerseywala Picks" products={filter(featured)} />
    </div>
  )
}
