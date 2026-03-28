'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

interface AdBannerProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
}

export default function AdBanner({ slot, format = 'auto' }: AdBannerProps) {
  const ref = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense script not loaded
    }
  }, [])

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        minHeight: '90px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-6641708917809759"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
