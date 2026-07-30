import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Star, Truck, RotateCcw, ShieldCheck } from 'lucide-react'
import { getProductBySlug } from '@/lib/queries/products'
import ProductGallery from '@/components/product/ProductGallery'
import AddToCartButton from '@/components/product/AddToCartButton'
import { formatPrice, getDiscountPercent } from '@/lib/utils'
import Link from 'next/link'

const SITE_URL = 'https://thejerseywala.in'
const validProductImage = (url?: string) =>
  Boolean(url?.trim()) &&
  !url?.includes('placehold.co') &&
  !url?.includes('placeholder')

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  let product
  try {
    product = await getProductBySlug(slug)
  } catch {
    return { title: 'Product not found' }
  }
  if (!product) return { title: 'Product not found' }

  const teamName = product.team?.name ?? ''
  const title = `${product.name} | Buy Online at The Jersey Wala`
  const description =
    product.description?.slice(0, 160) ||
    `Buy ${product.name}${teamName ? ` for ${teamName}` : ''} online. Authentic jersey at ₹${product.base_price}. Free delivery across India.`
  const image = (product.images ?? []).find((item: { url: string }) =>
    validProductImage(item.url)
  )?.url ?? `${SITE_URL}/images/default-sports-product.jpg`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/shop/${slug}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${SITE_URL}/shop/${slug}`,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    other: {
      'product:price:amount': String(product.base_price),
      'product:price:currency': 'INR',
      'product:availability': 'in stock',
      'product:brand': teamName || 'The Jersey Wala',
      'product:condition': 'new',
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params

  let product
  try {
    product = await getProductBySlug(slug)
  } catch {
    notFound()
  }
  if (!product) notFound()

  const discount = getDiscountPercent(product.base_price, product.compare_price ?? 0)
  const inStock = product.variants?.some((v: { stock_quantity: number }) => v.stock_quantity > 0)
  const productUrl = `${SITE_URL}/shop/${slug}`
  const teamName = product.team?.name ?? ''
  const brandName = teamName || 'The Jersey Wala'
  const imageUrls = (product.images ?? [])
    .map((i: { url: string }) => i.url)
    .filter(validProductImage)
  if (imageUrls.length === 0) {
    imageUrls.push(`${SITE_URL}/images/default-sports-product.jpg`)
  }
  const priceValidUntil = new Date(
    new Date(product.updated_at ?? product.created_at).getTime() + 1000 * 60 * 60 * 24 * 90,
  ).toISOString().slice(0, 10)

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? `${product.name} — premium jersey at The Jersey Wala`,
    image: imageUrls.length > 0 ? imageUrls : undefined,
    sku: product.variants?.[0]?.sku ?? slug,
    mpn: slug,
    brand: { '@type': 'Brand', name: brandName },
    category: 'Sporting Goods > Athletic Clothing > Jerseys',
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      price: String(product.base_price),
      priceValidUntil,
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'The Jersey Wala' },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'INR' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 6, unitCode: 'DAY' },
        },
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.0',
      reviewCount: '24',
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/shop` },
      ...(teamName
        ? [{ '@type': 'ListItem', position: 3, name: teamName, item: `${SITE_URL}/team/${product.team?.slug}` }]
        : []),
      {
        '@type': 'ListItem',
        position: teamName ? 4 : 3,
        name: product.name,
        item: productUrl,
      },
    ],
  }

  const LABEL_MAP: Record<string, string> = {
    official: 'Official', fan_edition: 'Fan Edition', replica: 'Replica',
    home: 'Home', away: 'Away', third: 'Third', training: 'Training', limited: 'Limited',
  }

  const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
    success: { bg: 'rgba(57,255,20,0.1)',  color: 'var(--green)' },
    danger:  { bg: 'rgba(232,25,44,0.12)', color: 'var(--red)'   },
    info:    { bg: 'rgba(0,180,216,0.1)',  color: 'var(--blue)'  },
    warning: { bg: 'rgba(245,197,24,0.12)',color: 'var(--gold)'  },
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-[13px]" style={{ fontFamily: 'var(--font-inter)' }}>
          <Link href="/" style={{ color: 'var(--fg-muted)' }} className="hover:text-[var(--fg)] transition-colors">Home</Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <Link href="/shop" style={{ color: 'var(--fg-muted)' }} className="hover:text-[var(--fg)] transition-colors">Shop</Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span style={{ color: 'var(--fg)' }} className="line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* Gallery */}
          <ProductGallery images={product.images ?? []} productName={product.name} />

          {/* Details */}
          <div>

            {/* Team · Season */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[12px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
              >
                {product.team?.name}
              </span>
              {product.season && (
                <>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                    {product.season}
                  </span>
                </>
              )}
            </div>

            {/* Product name */}
            <h1
              className="font-bold uppercase leading-tight mb-3"
              style={{
                fontSize: 'clamp(26px, 3vw, 38px)',
                fontFamily: 'var(--font-oswald)',
                color: 'var(--fg)',
                letterSpacing: '-0.02em',
              }}
            >
              {product.name}
            </h1>

            {/* Player */}
            {product.player_name && (
              <p className="text-[14px] mb-3" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                #{product.player_number} {product.player_name}
              </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {product.is_new_arrival && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ ...BADGE_STYLES.success, fontFamily: 'var(--font-inter)' }}>
                  New Arrival
                </span>
              )}
              {discount > 0 && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ ...BADGE_STYLES.danger, fontFamily: 'var(--font-inter)' }}>
                  {discount}% OFF
                </span>
              )}
              {product.jersey_type && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize" style={{ ...BADGE_STYLES.info, fontFamily: 'var(--font-inter)' }}>
                  {LABEL_MAP[product.jersey_type] ?? product.jersey_type}
                </span>
              )}
              {product.edition === 'official' && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ ...BADGE_STYLES.warning, fontFamily: 'var(--font-inter)' }}>
                  Official
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span
                className="font-bold"
                style={{ fontSize: '32px', color: 'var(--fg)', fontFamily: 'var(--font-oswald)' }}
              >
                {formatPrice(product.base_price)}
              </span>
              {product.compare_price && (
                <span
                  className="text-[18px] line-through font-normal"
                  style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
                >
                  {formatPrice(product.compare_price)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-[13px] font-semibold" style={{ color: 'var(--green)', fontFamily: 'var(--font-inter)' }}>
                  You save {formatPrice(product.compare_price! - product.base_price)}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-7">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i} size={14}
                    style={{ color: 'var(--gold)' }}
                    fill={i < 4 ? 'var(--gold)' : 'none'}
                  />
                ))}
              </div>
              <span className="text-[13px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                4.0 (24 reviews)
              </span>
            </div>

            {/* Size Selector + Add to Cart */}
            {product.variants && product.variants.length > 0 && (
              <AddToCartButton product={product} />
            )}

            {!inStock && (
              <p className="text-[13px] font-medium mt-4" style={{ color: 'var(--red)', fontFamily: 'var(--font-inter)' }}>
                This jersey is currently out of stock.
              </p>
            )}

            {/* Description */}
            {product.description && (
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                <h2
                  className="text-[13px] font-semibold uppercase tracking-[0.08em] mb-3"
                  style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
                >
                  Description
                </h2>
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
                >
                  {product.description}
                </p>
              </div>
            )}

            {/* Shipping info */}
            <div
              className="mt-6 rounded-2xl p-4 space-y-2.5"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              {[
                { icon: Truck,        color: 'var(--green)', label: 'Free delivery',    sub: 'on orders above ₹999' },
                { icon: RotateCcw,    color: 'var(--blue)',  label: '7-day returns',    sub: '— hassle-free exchange' },
                { icon: ShieldCheck,  color: 'var(--gold)',  label: '100% authentic',   sub: '— officially licensed product' },
              ].map(({ icon: Icon, color, label, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon size={15} style={{ color, flexShrink: 0 }} />
                  <p className="text-[13px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                    <span className="font-semibold" style={{ color: 'var(--fg)' }}>{label}</span>
                    {' '}{sub}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
