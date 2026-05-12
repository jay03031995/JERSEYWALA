'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { ArrowUp, ArrowDown, Search, Sparkles, CheckCircle2, AlertTriangle, ImageOff } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { computeSeoScore } from '@/lib/seo-score'

export type ProductRow = {
  id: string
  name: string
  slug: string
  base_price: number
  compare_price: number | null
  is_active: boolean
  is_featured: boolean
  is_new_arrival: boolean
  jersey_type: string | null
  edition: string | null
  season: string | null
  description: string | null
  meta_title: string | null
  meta_description: string | null
  tags: string[] | null
  variants: { stock_quantity: number }[]
  images: { url: string; is_primary: boolean }[]
  created_at: string
}

type SortKey = 'name' | 'base_price' | 'stock' | 'created_at' | 'seo' | 'status'
type SortDir = 'asc' | 'desc'

type ImageHealth = 'ok' | 'no_images' | 'broken'

type ImageHealthMap = Record<string, ImageHealth>

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]
const FEATURED_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'featured', label: 'Featured' },
  { value: 'not_featured', label: 'Not featured' },
]
const IMAGE_OPTIONS = [
  { value: 'all', label: 'Any images' },
  { value: 'ok', label: 'Image OK' },
  { value: 'broken', label: 'Broken (last scan)' },
  { value: 'no_images', label: 'No images' },
]

function totalStock(p: ProductRow) {
  return p.variants?.reduce((sum, v) => sum + (v.stock_quantity ?? 0), 0) ?? 0
}

function scoreOf(p: ProductRow) {
  return computeSeoScore({
    name: p.name,
    slug: p.slug,
    description: p.description,
    meta_title: p.meta_title,
    meta_description: p.meta_description,
    base_price: p.base_price,
    compare_price: p.compare_price,
    season: p.season,
    player_name: null,
    tags: p.tags,
    imageCount: p.images?.length ?? 0,
    variantCount: p.variants?.length ?? 0,
    isActive: p.is_active,
  })
}

function scoreColor(label: 'excellent' | 'good' | 'fair' | 'poor') {
  if (label === 'excellent') return { bg: 'rgba(57,255,20,0.1)', color: 'var(--green)' }
  if (label === 'good') return { bg: 'rgba(0,180,216,0.1)', color: 'var(--blue)' }
  if (label === 'fair') return { bg: 'rgba(245,197,24,0.12)', color: 'var(--gold)' }
  return { bg: 'rgba(232,25,44,0.12)', color: 'var(--red)' }
}

export default function ProductsAdminTable({ products: initial }: { products: ProductRow[] }) {
  const router = useRouter()
  const [products, setProducts] = useState<ProductRow[]>(initial)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'not_featured'>('all')
  const [imageFilter, setImageFilter] = useState<'all' | 'ok' | 'broken' | 'no_images'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [imageHealth, setImageHealth] = useState<ImageHealthMap>({})
  const [scanning, setScanning] = useState(false)
  const [, startTransition] = useTransition()
  const [page, setPage] = useState(1)
  const pageSize = 25

  const sorted = useMemo(() => {
    const matches = (p: ProductRow) => {
      if (statusFilter === 'active' && !p.is_active) return false
      if (statusFilter === 'inactive' && p.is_active) return false
      if (featuredFilter === 'featured' && !p.is_featured) return false
      if (featuredFilter === 'not_featured' && p.is_featured) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        if (
          !p.name?.toLowerCase().includes(q) &&
          !p.slug?.toLowerCase().includes(q) &&
          !p.description?.toLowerCase().includes(q)
        )
          return false
      }
      if (imageFilter !== 'all') {
        const health =
          imageHealth[p.id] ?? ((p.images?.length ?? 0) === 0 ? 'no_images' : 'ok')
        if (health !== imageFilter) return false
      }
      return true
    }

    const list = products.filter(matches)

    const cmp = (a: ProductRow, b: ProductRow) => {
      let av: string | number = 0
      let bv: string | number = 0
      if (sortKey === 'name') {
        av = a.name?.toLowerCase() ?? ''
        bv = b.name?.toLowerCase() ?? ''
      } else if (sortKey === 'base_price') {
        av = a.base_price ?? 0
        bv = b.base_price ?? 0
      } else if (sortKey === 'stock') {
        av = totalStock(a)
        bv = totalStock(b)
      } else if (sortKey === 'created_at') {
        av = a.created_at
        bv = b.created_at
      } else if (sortKey === 'seo') {
        av = scoreOf(a).total
        bv = scoreOf(b).total
      } else if (sortKey === 'status') {
        av = a.is_active ? 1 : 0
        bv = b.is_active ? 1 : 0
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    }

    return [...list].sort(cmp)
  }, [products, search, statusFilter, featuredFilter, imageFilter, imageHealth, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize)

  const allSelectedOnPage = pageRows.length > 0 && pageRows.every((p) => selected.has(p.id))

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }
  const toggleSelectPage = () => {
    const next = new Set(selected)
    if (allSelectedOnPage) pageRows.forEach((p) => next.delete(p.id))
    else pageRows.forEach((p) => next.add(p.id))
    setSelected(next)
  }
  const clearSelection = () => setSelected(new Set())

  const patchLocal = (id: string, patch: Partial<ProductRow>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  const toggleField = async (
    p: ProductRow,
    field: 'is_active' | 'is_featured' | 'is_new_arrival',
  ) => {
    const next = !p[field]
    patchLocal(p.id, { [field]: next })
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: next }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Update failed')
    } catch (err) {
      patchLocal(p.id, { [field]: p[field] })
      toast.error(err instanceof Error ? err.message : 'Update failed')
    }
  }

  const runBulk = async (action: string) => {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    const confirmMsg =
      action === 'delete' ? `Delete ${ids.length} product(s)? This cannot be undone.` : null
    if (confirmMsg && !confirm(confirmMsg)) return

    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Bulk action failed')
      toast.success(`Updated ${data.affected} product(s)`)
      clearSelection()
      startTransition(() => router.refresh())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bulk action failed')
    }
  }

  const scanImages = async () => {
    setScanning(true)
    toast.loading('Scanning image URLs…', { id: 'scan' })
    try {
      const res = await fetch('/api/admin/cleanup-broken-images', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Scan failed')
      const map: ImageHealthMap = {}
      for (const p of products) {
        const hasImages = (p.images?.length ?? 0) > 0
        map[p.id] = hasImages ? 'ok' : 'no_images'
      }
      for (const b of data.broken ?? []) {
        map[b.id] = b.reason === 'no_images' ? 'no_images' : 'broken'
      }
      setImageHealth(map)
      toast.success(`Scanned ${data.total_scanned}, ${data.broken_count} flagged`, { id: 'scan' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Scan failed', { id: 'scan' })
    } finally {
      setScanning(false)
    }
  }

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null
    return sortDir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div
        className="rounded-2xl p-4 flex flex-wrap items-center gap-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--fg-sub)' }}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search products by name, slug or description…"
            className="w-full pl-9 pr-3 py-2 rounded-xl text-[13px] outline-none"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg)' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
            setPage(1)
          }}
          className="px-3 py-2 rounded-xl text-[13px]"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg)' }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={featuredFilter}
          onChange={(e) => {
            setFeaturedFilter(e.target.value as 'all' | 'featured' | 'not_featured')
            setPage(1)
          }}
          className="px-3 py-2 rounded-xl text-[13px]"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg)' }}
        >
          {FEATURED_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={imageFilter}
          onChange={(e) => {
            setImageFilter(e.target.value as 'all' | 'ok' | 'broken' | 'no_images')
            setPage(1)
          }}
          className="px-3 py-2 rounded-xl text-[13px]"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg)' }}
        >
          {IMAGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={scanImages}
          disabled={scanning}
          className="px-3 py-2 rounded-xl text-[13px] font-medium disabled:opacity-50"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
        >
          {scanning ? 'Scanning…' : 'Scan images'}
        </button>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div
          className="rounded-2xl p-3 flex flex-wrap items-center gap-2"
          style={{ background: 'rgba(232,25,44,0.08)', border: '1px solid var(--red)' }}
        >
          <span className="text-[13px] font-medium pl-2" style={{ color: 'var(--fg)' }}>
            {selected.size} selected
          </span>
          <span className="flex-1" />
          {([
            ['Activate', 'activate'],
            ['Deactivate', 'deactivate'],
            ['Feature', 'feature'],
            ['Unfeature', 'unfeature'],
            ['Mark new', 'mark_new'],
            ['Unmark new', 'unmark_new'],
          ] as const).map(([label, action]) => (
            <button
              key={action}
              onClick={() => runBulk(action)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg)' }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => runBulk('delete')}
            className="px-3 py-1.5 rounded-lg text-[12px] font-bold"
            style={{ background: 'var(--red)', color: '#fff' }}
          >
            Delete
          </button>
          <button
            onClick={clearSelection}
            className="px-3 py-1.5 rounded-lg text-[12px]"
            style={{ color: 'var(--fg-sub)' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelectedOnPage}
                    onChange={toggleSelectPage}
                    aria-label="Select page"
                  />
                </th>
                <SortableTh label="Product" sortKey="name" current={sortKey} dir={sortDir} onClick={toggleSort} renderIcon={renderSortIcon} />
                <SortableTh label="Price" sortKey="base_price" current={sortKey} dir={sortDir} onClick={toggleSort} renderIcon={renderSortIcon} />
                <SortableTh label="Stock" sortKey="stock" current={sortKey} dir={sortDir} onClick={toggleSort} renderIcon={renderSortIcon} />
                <SortableTh label="SEO" sortKey="seo" current={sortKey} dir={sortDir} onClick={toggleSort} renderIcon={renderSortIcon} />
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--fg-sub)' }}>Images</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--fg-sub)' }}>Featured</th>
                <SortableTh label="Status" sortKey="status" current={sortKey} dir={sortDir} onClick={toggleSort} renderIcon={renderSortIcon} />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((p) => {
                const score = scoreOf(p)
                const colors = scoreColor(score.label)
                const stock = totalStock(p)
                const isLow = stock <= 10
                const primary = p.images?.find((i) => i.is_primary) ?? p.images?.[0]
                const imgCount = p.images?.length ?? 0
                const health: ImageHealth = imageHealth[p.id] ?? (imgCount === 0 ? 'no_images' : 'ok')

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        aria-label={`Select ${p.name}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg shrink-0 overflow-hidden flex items-center justify-center"
                          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
                        >
                          {primary ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={primary.url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageOff size={14} style={{ color: 'var(--fg-sub)' }} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium truncate max-w-[260px]" style={{ color: 'var(--fg)' }}>
                            {p.name}
                          </p>
                          <p className="text-[11px]" style={{ color: 'var(--fg-sub)' }}>
                            {p.season ?? '—'} · {p.jersey_type} · {p.edition}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-[13px] font-semibold" style={{ color: 'var(--fg)' }}>{formatPrice(p.base_price)}</p>
                      {p.compare_price && (
                        <p className="text-[11px] line-through" style={{ color: 'var(--fg-sub)' }}>
                          {formatPrice(p.compare_price)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px]" style={{ color: isLow ? 'var(--red)' : 'var(--fg)' }}>{stock}</p>
                      {isLow && <p className="text-[10px]" style={{ color: 'var(--red)' }}>Low stock</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{ background: colors.bg, color: colors.color }}
                        title={score.signals.filter((s) => !s.ok).map((s) => s.reason).join('\n') || 'All checks pass'}
                      >
                        <Sparkles size={10} />
                        {score.total}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {health === 'ok' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]" style={{ background: 'rgba(57,255,20,0.1)', color: 'var(--green)' }}>
                          <CheckCircle2 size={10} /> {imgCount}
                        </span>
                      )}
                      {health === 'broken' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]" style={{ background: 'rgba(232,25,44,0.12)', color: 'var(--red)' }}>
                          <AlertTriangle size={10} /> Broken
                        </span>
                      )}
                      {health === 'no_images' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--fg-sub)' }}>
                          <ImageOff size={10} /> None
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Toggle on={p.is_featured} onChange={() => toggleField(p, 'is_featured')} />
                    </td>
                    <td className="px-4 py-3">
                      <Toggle on={p.is_active} onChange={() => toggleField(p, 'is_active')} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-[12px] font-medium px-3 py-1 rounded-lg"
                        style={{ color: 'var(--fg-muted)', background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-[13px]" style={{ color: 'var(--fg-muted)' }}>
                    No products match these filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[12px]" style={{ color: 'var(--fg-sub)' }}>
              Page {page} of {totalPages} · {sorted.length} result{sorted.length === 1 ? '' : 's'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-[12px] disabled:opacity-40"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-[12px] disabled:opacity-40"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SortableTh({
  label,
  sortKey,
  current,
  dir,
  onClick,
  renderIcon,
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  dir: SortDir
  onClick: (key: SortKey) => void
  renderIcon: (key: SortKey) => React.ReactNode
}) {
  return (
    <th
      onClick={() => onClick(sortKey)}
      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] cursor-pointer select-none"
      style={{ color: current === sortKey ? 'var(--fg)' : 'var(--fg-sub)' }}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {renderIcon(sortKey)}
      </span>
      <span aria-hidden hidden>{dir}</span>
    </th>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-pressed={on}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
      style={{ background: on ? 'var(--green)' : 'var(--border)' }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
        style={{ transform: on ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  )
}
