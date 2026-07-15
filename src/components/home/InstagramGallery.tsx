import { Camera } from 'lucide-react'
import type { HomeBanner } from '@/lib/queries/banners'

type Props = {
  posts: HomeBanner[]
  instagramUrl?: string
}

// Camera-style grid driven by admin-managed banners (position 'instagram').
// Renders only when the admin has added images, so it never shows empty.
export default function CameraGallery({ posts, instagramUrl }: Props) {
  if (!posts || posts.length === 0) return null

  return (
    <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center mb-10">
          <p
            className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-2 inline-flex items-center gap-1.5"
            style={{ color: 'var(--red)', fontFamily: 'var(--font-inter)' }}
          >
            <Camera size={13} /> @thejerseywala
          </p>
          <h2
            className="text-[32px] sm:text-[40px] font-bold uppercase leading-none"
            style={{ fontFamily: 'var(--font-oswald)', letterSpacing: '-0.02em', color: 'var(--fg)' }}
          >
            Fans in the Wild
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {posts.slice(0, 6).map((post) => {
            const tile = (
              <div
                className="relative aspect-square rounded-2xl overflow-hidden group"
                style={{ border: '1px solid var(--border)', background: 'var(--bg-raised)' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image_url}
                  alt={post.title || '@thejerseywala on Instagram'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(20,15,10,0.35)' }}
                >
                  <Camera size={22} color="#fff" />
                </div>
              </div>
            )
            const link = post.cta_link || instagramUrl
            return link ? (
              <a key={post.id} href={link} target="_blank" rel="noopener noreferrer">
                {tile}
              </a>
            ) : (
              <div key={post.id}>{tile}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
