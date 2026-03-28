'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'

interface Banner {
  id: string
  title: string
  subtitle?: string
  image_url: string
  cta_text?: string
  cta_link?: string
  position: string
  display_order: number
  is_active: boolean
  starts_at?: string
  ends_at?: string
}

const POSITIONS = ['homepage_hero', 'homepage_popup', 'shop_top', 'product_page', 'checkout', 'announcement_bar']

const inputStyle = {
  background: 'var(--bg-raised)',
  border: '1px solid var(--border)',
  color: 'var(--fg)',
  fontFamily: 'var(--font-inter)',
}

export default function PopupManager({ banners: initial }: { banners: Banner[] }) {
  const router = useRouter()
  const [banners, setBanners] = useState<Banner[]>(initial)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [newBanner, setNewBanner] = useState<Partial<Banner>>({
    title: '', subtitle: '', image_url: '', cta_text: '', cta_link: '',
    position: 'homepage_popup', display_order: 1, is_active: true,
  })

  const handleToggle = async (banner: Banner) => {
    setSaving(banner.id)
    const res = await fetch(`/api/admin/banners/${banner.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !banner.is_active }),
    })
    setSaving(null)
    if (res.ok) {
      setBanners((b) => b.map((x) => x.id === banner.id ? { ...x, is_active: !x.is_active } : x))
      toast.success(banner.is_active ? 'Banner hidden' : 'Banner activated')
    } else toast.error('Failed to update')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    setSaving(id)
    const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    setSaving(null)
    if (res.ok) {
      setBanners((b) => b.filter((x) => x.id !== id))
      toast.success('Banner deleted')
    } else toast.error('Delete failed')
  }

  const handleCreate = async () => {
    if (!newBanner.title?.trim()) { toast.error('Title required'); return }
    setSaving('new')
    const res = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBanner),
    })
    const data = await res.json()
    setSaving(null)
    if (data.success) {
      toast.success('Banner created!')
      setCreating(false)
      setNewBanner({ title: '', subtitle: '', image_url: '', cta_text: '', cta_link: '', position: 'homepage_popup', display_order: 1, is_active: true })
      router.refresh()
    } else toast.error(data.error ?? 'Create failed')
  }

  return (
    <div className="space-y-5">
      {/* Create new */}
      <div className="flex justify-end">
        <button
          onClick={() => setCreating(!creating)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-opacity hover:opacity-90"
          style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
        >
          <Plus size={14} /> New Popup / Banner
        </button>
      </div>

      {creating && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
            New Banner / Popup
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>Title *</label>
              <input value={newBanner.title ?? ''} onChange={(e) => setNewBanner((b) => ({ ...b, title: e.target.value }))}
                placeholder="e.g. IPL 2026 Sale!" className="w-full px-3 py-2 rounded-xl text-[13px] outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>Subtitle</label>
              <input value={newBanner.subtitle ?? ''} onChange={(e) => setNewBanner((b) => ({ ...b, subtitle: e.target.value }))}
                placeholder="e.g. Up to 30% off all jerseys" className="w-full px-3 py-2 rounded-xl text-[13px] outline-none" style={inputStyle} />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>Image URL</label>
              <input value={newBanner.image_url ?? ''} onChange={(e) => setNewBanner((b) => ({ ...b, image_url: e.target.value }))}
                placeholder="https://..." className="w-full px-3 py-2 rounded-xl text-[12px] outline-none font-mono" style={inputStyle} />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>Button Text</label>
              <input value={newBanner.cta_text ?? ''} onChange={(e) => setNewBanner((b) => ({ ...b, cta_text: e.target.value }))}
                placeholder="e.g. Shop Now" className="w-full px-3 py-2 rounded-xl text-[13px] outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>Button Link</label>
              <input value={newBanner.cta_link ?? ''} onChange={(e) => setNewBanner((b) => ({ ...b, cta_link: e.target.value }))}
                placeholder="/sport/ipl" className="w-full px-3 py-2 rounded-xl text-[13px] outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>Position</label>
              <select value={newBanner.position} onChange={(e) => setNewBanner((b) => ({ ...b, position: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-[13px] outline-none" style={inputStyle}>
                {POSITIONS.map((p) => <option key={p} value={p}>{p.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>Display Order</label>
              <input type="number" value={newBanner.display_order ?? 1} onChange={(e) => setNewBanner((b) => ({ ...b, display_order: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl text-[13px] outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>Start Date</label>
              <input type="datetime-local" value={newBanner.starts_at ?? ''} onChange={(e) => setNewBanner((b) => ({ ...b, starts_at: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-[13px] outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>End Date</label>
              <input type="datetime-local" value={newBanner.ends_at ?? ''} onChange={(e) => setNewBanner((b) => ({ ...b, ends_at: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-[13px] outline-none" style={inputStyle} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setCreating(false)}
              className="px-4 py-2 rounded-xl text-[13px] font-medium" style={{ color: 'var(--fg-muted)', background: 'var(--bg-raised)', border: '1px solid var(--border)', fontFamily: 'var(--font-inter)' }}>
              Cancel
            </button>
            <button onClick={handleCreate} disabled={saving === 'new'}
              className="px-5 py-2 rounded-xl text-[13px] font-bold disabled:opacity-50" style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}>
              {saving === 'new' ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Banners list */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {banners.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[13px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>No banners yet. Create your first popup!</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {banners.map((b) => (
              <div key={b.id} className="flex items-center gap-4 px-5 py-4">
                {/* Preview */}
                <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                  {b.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-base">🖼</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>{b.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-raised)', color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                      {b.position.replace(/_/g, ' ')}
                    </span>
                    {b.cta_text && <span className="text-[11px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>→ {b.cta_text}</span>}
                    {b.ends_at && <span className="text-[10px]" style={{ color: 'var(--gold)', fontFamily: 'var(--font-inter)' }}>Ends {new Date(b.ends_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{
                    background: b.is_active ? 'rgba(57,255,20,0.1)' : 'rgba(255,255,255,0.06)',
                    color: b.is_active ? 'var(--green)' : 'var(--fg-sub)',
                    fontFamily: 'var(--font-inter)',
                  }}>
                    {b.is_active ? 'Live' : 'Hidden'}
                  </span>
                  <button onClick={() => handleToggle(b)} disabled={saving === b.id}
                    className="p-1.5 rounded-lg transition-opacity hover:opacity-80" style={{ color: 'var(--fg-muted)' }}>
                    {b.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => handleDelete(b.id)} disabled={saving === b.id}
                    className="p-1.5 rounded-lg transition-opacity hover:opacity-80" style={{ color: 'var(--red)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
