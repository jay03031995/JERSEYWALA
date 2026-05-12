'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Link2, Loader2, Sparkles, Upload, CheckCircle2, AlertTriangle } from 'lucide-react'

type SampleProduct = {
  slug: string
  name: string
  price: number | null
  comparePrice: number | null
  images: string[]
  vendor: string | null
}

type Result = { slug: string; status: string }

const input = {
  background: 'var(--bg-raised)',
  border: '1px solid var(--border)',
  color: 'var(--fg)',
  fontFamily: 'var(--font-inter)',
} as const

export default function ImportFromSite() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<{ total: number; sample: SampleProduct[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState({ done: 0, created: 0, skipped: 0, failed: 0 })
  const [log, setLog] = useState<Result[]>([])

  const doPreview = async () => {
    if (!url.trim()) {
      toast.error('Paste a store or collection URL')
      return
    }
    setLoading(true)
    setPreview(null)
    setLog([])
    try {
      const res = await fetch('/api/admin/products/scrape-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), mode: 'preview' }),
      })
      const text = await res.text()
      let json: { total?: number; sample?: SampleProduct[]; error?: string } = {}
      try { json = text ? JSON.parse(text) : {} } catch { /* */ }
      if (!res.ok || !json.total) throw new Error(json.error ?? 'No products found')
      setPreview({ total: json.total, sample: json.sample ?? [] })
      toast.success(`Found ${json.total} products`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Fetch failed')
    } finally {
      setLoading(false)
    }
  }

  const importAll = async () => {
    if (!preview) return
    setImporting(true)
    setProgress({ done: 0, created: 0, skipped: 0, failed: 0 })
    setLog([])
    try {
      let start = 0
      while (true) {
        const res = await fetch('/api/admin/products/scrape-site', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim(), mode: 'import', start, limit: 10 }),
        })
        const text = await res.text()
        let json: { processed?: Result[]; next?: number | null; error?: string } = {}
        try { json = text ? JSON.parse(text) : {} } catch { /* */ }
        if (!res.ok) throw new Error(json.error ?? `Import failed (HTTP ${res.status})`)

        const batch = json.processed ?? []
        setLog((prev) => [...prev, ...batch])
        setProgress((prev) => ({
          done: prev.done + batch.length,
          created: prev.created + batch.filter((r) => r.status === 'created').length,
          skipped: prev.skipped + batch.filter((r) => r.status === 'skipped').length,
          failed: prev.failed + batch.filter((r) => r.status === 'failed').length,
        }))

        if (json.next == null) break
        start = json.next
      }
      toast.success('Import finished')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div
        className="rounded-2xl p-4 flex flex-wrap items-center gap-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <Link2 size={16} style={{ color: 'var(--fg-sub)' }} />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') doPreview()
          }}
          placeholder="https://shop.example.com   or   https://shop.example.com/collections/all"
          className="flex-1 min-w-[280px] px-3 py-2 rounded-xl text-[13px] outline-none"
          style={input}
        />
        <button
          onClick={doPreview}
          disabled={loading || importing}
          className="px-4 py-2 rounded-xl text-[13px] font-bold flex items-center gap-2 disabled:opacity-60"
          style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? 'Scanning…' : 'Scan site'}
        </button>
      </div>

      <p className="text-[12px] px-1" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
        Works on any Shopify store (most jersey stores) via their public products.json feed. Paste either the homepage URL (imports the whole catalog) or a collection URL like <code>/collections/fifa-world-cup-2026-jerseys</code> to scope the import.
      </p>

      {preview && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[15px] font-bold" style={{ color: 'var(--fg)' }}>
                {preview.total} product{preview.total === 1 ? '' : 's'} found
              </p>
              <p className="text-[12px]" style={{ color: 'var(--fg-sub)' }}>
                Slugs that already exist will be skipped.
              </p>
            </div>
            <button
              onClick={importAll}
              disabled={importing}
              className="px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 disabled:opacity-60"
              style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
            >
              {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {importing ? 'Importing…' : `Import all ${preview.total}`}
            </button>
          </div>

          {/* Sample preview */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {preview.sample.map((p) => (
              <div
                key={p.slug}
                className="rounded-xl p-3 flex gap-3"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-16 h-16 rounded-lg overflow-hidden shrink-0"
                  style={{ background: 'var(--bg)' }}
                >
                  {p.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--fg)' }}>{p.name}</p>
                  <p className="text-[11px]" style={{ color: 'var(--fg-sub)' }}>{p.vendor ?? 'Unknown brand'}</p>
                  {p.price && (
                    <p className="text-[12px]" style={{ color: 'var(--fg)' }}>
                      ₹{p.price}
                      {p.comparePrice && p.comparePrice > p.price && (
                        <span className="ml-1 line-through text-[11px]" style={{ color: 'var(--fg-sub)' }}>
                          ₹{p.comparePrice}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {importing && (
            <div className="grid grid-cols-4 gap-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <Stat label="Processed" value={progress.done} />
              <Stat label="Created" value={progress.created} color="var(--green)" />
              <Stat label="Skipped" value={progress.skipped} color="var(--gold)" />
              <Stat label="Failed" value={progress.failed} color="var(--red)" />
            </div>
          )}
        </div>
      )}

      {log.length > 0 && (
        <div
          className="rounded-2xl p-4 max-h-[240px] overflow-y-auto"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {log.map((r, i) => (
            <div
              key={`${r.slug}-${i}`}
              className="flex items-center gap-2 text-[12px] py-1"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {r.status === 'created' && <CheckCircle2 size={12} style={{ color: 'var(--green)' }} />}
              {r.status === 'skipped' && <span style={{ color: 'var(--gold)', fontSize: 10 }}>•</span>}
              {r.status === 'failed' && <AlertTriangle size={12} style={{ color: 'var(--red)' }} />}
              <span style={{ color: 'var(--fg-muted)' }}>{r.slug}</span>
              <span className="ml-auto" style={{ color: 'var(--fg-sub)' }}>{r.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div
      className="rounded-lg p-2 text-center"
      style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
    >
      <p className="text-[18px] font-bold" style={{ color: color ?? 'var(--fg)' }}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--fg-sub)' }}>{label}</p>
    </div>
  )
}
