'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

type Banner = {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  cta_text: string | null
  cta_link: string | null
}

const STORAGE_KEY = 'jw_popup_seen'
const SHOW_AFTER_MS = 1200

export default function HomePopup() {
  const [banner, setBanner] = useState<Banner | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    const seen = (() => {
      try {
        return sessionStorage.getItem(STORAGE_KEY)
      } catch {
        return null
      }
    })()

    fetch('/api/banners?position=homepage_popup', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { banners?: Banner[] } | null) => {
        if (cancelled) return
        const list = data?.banners ?? []
        if (list.length === 0) return
        const next = list[0]
        if (seen === next.id) return
        setBanner(next)
        setTimeout(() => {
          if (!cancelled) setOpen(true)
        }, SHOW_AFTER_MS)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  const dismiss = () => {
    if (banner) {
      try {
        sessionStorage.setItem(STORAGE_KEY, banner.id)
      } catch {
        /* ignore */
      }
    }
    setOpen(false)
  }

  if (!banner || !open) return null

  const cta = banner.cta_text && banner.cta_link ? (
    <Link
      href={banner.cta_link}
      onClick={dismiss}
      className="inline-flex items-center justify-center mt-4 w-full px-4 py-2.5 rounded-xl text-[13px] font-bold"
      style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
    >
      {banner.cta_text}
    </Link>
  ) : null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
        >
          <X size={14} />
        </button>
        {banner.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={banner.image_url} alt={banner.title} className="w-full aspect-[4/3] object-cover" />
        )}
        <div className="p-5">
          <p
            className="text-[20px] font-bold leading-tight"
            style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
          >
            {banner.title}
          </p>
          {banner.subtitle && (
            <p className="text-[13px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
              {banner.subtitle}
            </p>
          )}
          {cta}
        </div>
      </div>
    </div>
  )
}
