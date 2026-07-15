import Link from 'next/link'

export type CollectionTile = {
  label: string
  href: string
  image: string
}

// Circular-tile "Shop by Collection" row. Tiles are computed upstream from
// real sports/leagues + representative product images, so this stays purely
// presentational and fully backend-driven.
export default function ShopByCollection({ tiles }: { tiles: CollectionTile[] }) {
  if (!tiles || tiles.length === 0) return null

  return (
    <section style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center mb-10">
          <p
            className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-2"
            style={{ color: 'var(--red)', fontFamily: 'var(--font-inter)' }}
          >
            Find Your Fit
          </p>
          <h2
            className="text-[32px] sm:text-[40px] font-bold uppercase leading-none"
            style={{ fontFamily: 'var(--font-oswald)', letterSpacing: '-0.02em', color: 'var(--fg)' }}
          >
            Shop by Collection
          </h2>
        </div>

        <div
          className="flex gap-6 sm:gap-8 overflow-x-auto pb-3 sm:justify-center"
          style={{ scrollbarWidth: 'none' }}
        >
          {tiles.map((tile) => (
            <Link
              key={tile.label + tile.href}
              href={tile.href}
              className="group flex-shrink-0 flex flex-col items-center gap-3"
              style={{ width: 150 }}
            >
              <div
                className="relative rounded-full overflow-hidden transition-transform group-hover:scale-[1.04]"
                style={{
                  width: 150,
                  height: 150,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-raised)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.image}
                  alt={tile.label}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <span
                className="text-[15px] font-semibold text-center"
                style={{ color: 'var(--fg)', fontFamily: 'var(--font-oswald)', letterSpacing: '0.01em' }}
              >
                {tile.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
