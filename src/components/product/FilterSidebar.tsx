'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Check, X } from 'lucide-react'

const SPORTS   = ['Football', 'Cricket', 'IPL']
const EDITIONS = ['official', 'fan_edition', 'replica']
const TYPES    = ['home', 'away', 'third', 'training', 'limited']
const SIZES    = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

const LABEL: Record<string, string> = {
  official: 'Official',
  fan_edition: 'Fan Edition',
  replica: 'Replica',
  home: 'Home',
  away: 'Away',
  third: 'Third',
  training: 'Training',
  limited: 'Limited',
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-3"
      style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
    >
      {children}
    </p>
  )
}

function CheckRow({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label
      className="flex items-center gap-2.5 cursor-pointer group"
      onClick={onChange}
    >
      {/* Custom checkbox */}
      <span
        className="w-4 h-4 rounded-[5px] flex items-center justify-center shrink-0 transition-all"
        style={{
          background: checked ? 'var(--fg)' : 'transparent',
          border: `1px solid ${checked ? 'var(--fg)' : 'var(--border)'}`,
        }}
      >
        {checked && <Check size={10} style={{ color: 'var(--bg)' }} strokeWidth={3} />}
      </span>
      <span
        className="text-[13px] transition-colors"
        style={{
          color: checked ? 'var(--fg)' : 'var(--fg-muted)',
          fontFamily: 'var(--font-inter)',
        }}
      >
        {label}
      </span>
    </label>
  )
}

export default function FilterSidebar() {
  const router = useRouter()
  const params = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const p = new URLSearchParams(params.toString())
      const existing = p.getAll(key)
      if (existing.includes(value)) {
        p.delete(key)
        existing.filter((v) => v !== value).forEach((v) => p.append(key, v))
      } else {
        p.append(key, value)
      }
      router.push(`/shop?${p.toString()}`)
    },
    [params, router]
  )

  const isChecked = (key: string, value: string) => params.getAll(key).includes(value)

  const hasFilters = ['sport', 'edition', 'type', 'size'].some(
    (k) => params.getAll(k).length > 0
  )

  return (
    <aside
      className="w-56 shrink-0 rounded-2xl p-5 sticky top-20"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-[15px] font-semibold"
          style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}
        >
          Filters
        </h2>
        {hasFilters && (
          <button
            onClick={() => router.push('/shop')}
            className="flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--red)', fontFamily: 'var(--font-inter)' }}
          >
            <X size={11} /> Clear
          </button>
        )}
      </div>

      {/* Sport */}
      <div className="mb-6">
        <SectionLabel>Sport</SectionLabel>
        <div className="space-y-2.5">
          {SPORTS.map((s) => (
            <CheckRow
              key={s} label={s}
              checked={isChecked('sport', s.toLowerCase())}
              onChange={() => update('sport', s.toLowerCase())}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)', marginBottom: '20px' }} />

      {/* Edition */}
      <div className="mb-6">
        <SectionLabel>Edition</SectionLabel>
        <div className="space-y-2.5">
          {EDITIONS.map((e) => (
            <CheckRow
              key={e} label={LABEL[e]}
              checked={isChecked('edition', e)}
              onChange={() => update('edition', e)}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)', marginBottom: '20px' }} />

      {/* Type */}
      <div className="mb-6">
        <SectionLabel>Type</SectionLabel>
        <div className="space-y-2.5">
          {TYPES.map((t) => (
            <CheckRow
              key={t} label={LABEL[t]}
              checked={isChecked('type', t)}
              onChange={() => update('type', t)}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)', marginBottom: '20px' }} />

      {/* Size */}
      <div>
        <SectionLabel>Size</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((size) => {
            const active = isChecked('size', size)
            return (
              <button
                key={size}
                onClick={() => update('size', size)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: active ? 'var(--fg)' : 'transparent',
                  color: active ? 'var(--bg)' : 'var(--fg-muted)',
                  border: `1px solid ${active ? 'var(--fg)' : 'var(--border)'}`,
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {size}
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
