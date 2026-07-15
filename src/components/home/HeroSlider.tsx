'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import type { HomeBanner } from '@/lib/queries/banners'

// Fallback slide used only when the admin hasn't configured any hero banners
// yet, so the homepage never renders an empty hero.
const FALLBACK: HomeBanner[] = [
  {
    id: 'fallback',
    title: 'Worn By Legends. Built For Fans.',
    subtitle: 'Official & replica jerseys for cricket, football and IPL — every team, every size, delivered fast across India.',
    image_url:
      'https://cdn.shopify.com/s/files/1/0627/2938/8118/files/TP0293ID__RNVL_B.jpg?v=1772786445',
    cta_text: 'Shop the Collection',
    cta_link: '/shop',
  },
]

export default function HeroSlider({ banners }: { banners: HomeBanner[] }) {
  const slides = banners.length > 0 ? banners : FALLBACK
  const [index, setIndex] = useState(0)
  const count = slides.length

  const go = useCallback((n: number) => setIndex(((n % count) + count) % count), [count])

  useEffect(() => {
    if (count <= 1) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 5500)
    return () => clearInterval(id)
  }, [count])

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: 'var(--bg-raised)' }}
      aria-roledescription="carousel"
    >
      <div className="relative h-[62vh] min-h-[420px] max-h-[720px]">
        {slides.map((slide, i) => {
          const active = i === index
          const inner = (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image_url}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
              {/* Legibility scrim — stronger on the left where text sits */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(20,15,10,0.72) 0%, rgba(20,15,10,0.38) 42%, rgba(20,15,10,0.05) 70%)',
                }}
              />
              <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-center">
                <div className="max-w-xl">
                  <p
                    className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-4"
                    style={{ color: '#fff', opacity: 0.85, fontFamily: 'var(--font-inter)' }}
                  >
                    The Jersey Wala
                  </p>
                  <h1
                    className="text-white font-bold uppercase leading-[0.92] mb-5"
                    style={{
                      fontSize: 'clamp(38px, 6.5vw, 82px)',
                      letterSpacing: '-0.02em',
                      fontFamily: 'var(--font-oswald)',
                    }}
                  >
                    {slide.title}
                  </h1>
                  {slide.subtitle && (
                    <p
                      className="text-[15px] sm:text-[17px] leading-relaxed mb-8 max-w-md"
                      style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-inter)' }}
                    >
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.cta_text && slide.cta_link && (
                    <Link
                      href={slide.cta_link}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[14px] font-semibold transition-transform hover:scale-[1.03]"
                      style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
                    >
                      {slide.cta_text} <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              </div>
            </>
          )
          return (
            <div
              key={slide.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: active ? 1 : 0, pointerEvents: active ? 'auto' : 'none' }}
              aria-hidden={!active}
            >
              {inner}
            </div>
          )
        })}

        {count > 1 && (
          <>
            <button
              onClick={() => go(index - 1)}
              aria-label="Previous slide"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-colors"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', color: '#fff' }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="Next slide"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-colors"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', color: '#fff' }}
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="rounded-full transition-all"
                  style={{
                    width: i === index ? 26 : 8,
                    height: 8,
                    background: i === index ? 'var(--red)' : 'rgba(255,255,255,0.6)',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
