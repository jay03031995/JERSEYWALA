'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Link2, Loader2, Sparkles, Trash2, Upload } from 'lucide-react'

const JERSEY_TYPES = ['home', 'away', 'third', 'training', 'limited']
const EDITIONS = ['official', 'fan_edition', 'replica']

type Team = { id: string; name: string; slug: string }

type Scraped = {
  source: string
  name: string
  description: string
  price: number | null
  comparePrice: number | null
  currency: string | null
  images: string[]
  sizes: string[]
  vendor: string | null
  tags: string[]
  slug: string
  sourceUrl: string
}

const input = {
  background: 'var(--bg-raised)',
  border: '1px solid var(--border)',
  color: 'var(--fg)',
  fontFamily: 'var(--font-inter)',
} as const

const label = { color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' } as const

export default function ImportFromUrl({ teams }: { teams: Team[] }) {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [data, setData] = useState<Scraped | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [season, setSeason] = useState('')
  const [teamId, setTeamId] = useState('')
  const [jerseyType, setJerseyType] = useState('home')
  const [edition, setEdition] = useState('fan_edition')
  const [images, setImages] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [isFeatured, setIsFeatured] = useState(true)
  const [isNewArrival, setIsNewArrival] = useState(true)

  const fetchUrl = async () => {
    if (!url.trim()) {
      toast.error('Paste a product URL first')
      return
    }
    setLoading(true)
    setData(null)
    try {
      const res = await fetch('/api/admin/products/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const text = await res.text()
      let json: { product?: Scraped; error?: string } = {}
      try { json = text ? JSON.parse(text) : {} } catch { /* */ }
      if (!res.ok || !json.product) throw new Error(json.error ?? `Fetch failed (HTTP ${res.status})`)

      const p = json.product
      setData(p)
      setName(p.name)
      setSlug(p.slug)
      setDescription(p.description)
      setPrice(p.price ? String(p.price) : '')
      setComparePrice(p.comparePrice ? String(p.comparePrice) : '')
      setImages(p.images)
      setSizes(p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL', 'XXL'])
      toast.success(`Found product via ${p.source}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not fetch URL')
    } finally {
      setLoading(false)
    }
  }

  const importProduct = async () => {
    if (!name || !slug || !price) {
      toast.error('Name, slug, and price are required')
      return
    }
    setImporting(true)
    try {
      const variants = sizes.map((s) => ({ size: s, stock_quantity: 20, additional_price: 0 }))
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          team_id: teamId || null,
          season,
          jersey_type: jerseyType,
          edition,
          base_price: Number(price),
          compare_price: comparePrice ? Number(comparePrice) : null,
          is_active: true,
          is_featured: isFeatured,
          is_new_arrival: isNewArrival,
          tags: data?.tags ?? [],
          images,
          variants,
        }),
      })
      const text = await res.text()
      let json: { id?: string; error?: string } = {}
      try { json = text ? JSON.parse(text) : {} } catch { /* */ }
      if (!res.ok || !json.id) throw new Error(json.error ?? `Import failed (HTTP ${res.status})`)
      toast.success('Product imported')
      router.push(`/admin/products/${json.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const updateSlug = (v: string) => {
    setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
  }

  return (
    <div className="space-y-5">
      {/* URL bar */}
      <div
        className="rounded-2xl p-4 flex flex-wrap items-center gap-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <Link2 size={16} style={{ color: 'var(--fg-sub)' }} />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') fetchUrl()
          }}
          placeholder="https://example.com/products/some-jersey"
          className="flex-1 min-w-[280px] px-3 py-2 rounded-xl text-[13px] outline-none"
          style={input}
        />
        <button
          onClick={fetchUrl}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-[13px] font-bold flex items-center gap-2 disabled:opacity-60"
          style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? 'Fetching…' : 'Fetch product'}
        </button>
      </div>

      {!data && !loading && (
        <p className="text-[12px] px-1" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
          Tip: works best with Shopify product pages (most jersey stores). Falls back to JSON-LD Product schema and Open Graph product tags for other sites.
        </p>
      )}

      {data && (
        <div
          className="rounded-2xl p-5 space-y-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {/* Source badge */}
          <div className="flex items-center justify-between">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: 'rgba(0,180,216,0.1)', color: 'var(--blue)' }}
            >
              Parsed via {data.source}
            </span>
            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] underline"
              style={{ color: 'var(--fg-sub)' }}
            >
              Source URL
            </a>
          </div>

          {/* Name / slug */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={label}>Name</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                style={input}
              />
            </div>
            <div>
              <p className="text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={label}>Slug</p>
              <input
                value={slug}
                onChange={(e) => updateSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                style={input}
              />
            </div>
          </div>

          {/* Team / season / type / edition */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <p className="text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={label}>Team</p>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                style={input}
              >
                <option value="">— None —</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={label}>Season</p>
              <input
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="2026"
                className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                style={input}
              />
            </div>
            <div>
              <p className="text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={label}>Jersey type</p>
              <select
                value={jerseyType}
                onChange={(e) => setJerseyType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-[13px] outline-none capitalize"
                style={input}
              >
                {JERSEY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={label}>Edition</p>
              <select
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                style={input}
              >
                {EDITIONS.map((t) => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Prices */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={label}>
                Price (₹) {data.currency && data.currency !== 'INR' ? `— source was ${data.currency}` : ''}
              </p>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                style={input}
              />
            </div>
            <div>
              <p className="text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={label}>Compare price (₹)</p>
              <input
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                style={input}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={label}>Description</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
              style={input}
            />
          </div>

          {/* Images */}
          <div>
            <p className="text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={label}>
              Images ({images.length})
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {images.map((src, i) => (
                <div
                  key={i}
                  className="relative rounded-lg overflow-hidden aspect-square"
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 p-1 rounded-md"
                    style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                    aria-label="Remove image"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <p className="text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={label}>
              Sizes (comma separated)
            </p>
            <input
              value={sizes.join(', ')}
              onChange={(e) =>
                setSizes(e.target.value.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean))
              }
              className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
              style={input}
            />
          </div>

          {/* Flags */}
          <div className="flex gap-5">
            <label className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--fg)' }}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--fg)' }}>
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
              />
              New arrival
            </label>
          </div>

          <div className="flex justify-end pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              onClick={importProduct}
              disabled={importing}
              className="px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 disabled:opacity-60"
              style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
            >
              {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {importing ? 'Importing…' : 'Import product'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
