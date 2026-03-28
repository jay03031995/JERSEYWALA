'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Plus, Trash2, ImagePlus } from 'lucide-react'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
const JERSEY_TYPES = ['home', 'away', 'third', 'training', 'goalkeeper', 'limited']
const EDITIONS = ['official', 'fan_edition', 'replica']

interface Team { id: string; name: string; slug: string }
interface Variant { size: string; stock_quantity: number; additional_price: number; sku: string }

interface ProductData {
  id?: string
  name: string; slug: string; description: string
  team_id: string; player_name: string; player_number: string
  season: string; jersey_type: string; edition: string
  base_price: string; compare_price: string; cost_price: string
  is_active: boolean; is_featured: boolean; is_new_arrival: boolean
  meta_title: string; meta_description: string; tags: string
  images: string[]; variants: Variant[]
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const inputStyle = {
  background: 'var(--bg-raised)',
  border: '1px solid var(--border)',
  color: 'var(--fg)',
  fontFamily: 'var(--font-inter)',
}
const labelStyle = {
  color: 'var(--fg-sub)',
  fontFamily: 'var(--font-inter)',
}

export default function ProductForm({ teams, initial }: { teams: Team[]; initial?: Partial<ProductData> }) {
  const router = useRouter()
  const isEdit = !!initial?.id

  const [form, setForm] = useState<ProductData>({
    id: initial?.id,
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    description: initial?.description ?? '',
    team_id: initial?.team_id ?? '',
    player_name: initial?.player_name ?? '',
    player_number: initial?.player_number ?? '',
    season: initial?.season ?? '',
    jersey_type: initial?.jersey_type ?? 'home',
    edition: initial?.edition ?? 'fan_edition',
    base_price: initial?.base_price ?? '',
    compare_price: initial?.compare_price ?? '',
    cost_price: initial?.cost_price ?? '',
    is_active: initial?.is_active ?? true,
    is_featured: initial?.is_featured ?? false,
    is_new_arrival: initial?.is_new_arrival ?? false,
    meta_title: initial?.meta_title ?? '',
    meta_description: initial?.meta_description ?? '',
    tags: initial?.tags ?? '',
    images: initial?.images?.length ? initial.images : [''],
    variants: initial?.variants?.length ? initial.variants : SIZES.map((s) => ({ size: s, stock_quantity: 0, additional_price: 0, sku: '' })),
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'media' | 'variants' | 'seo'>('general')

  const set = (key: keyof ProductData, val: unknown) => setForm((f) => ({ ...f, [key]: val }))

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: f.slug || slugify(name) }))
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Name and slug are required')
      return
    }
    setSaving(true)
    const payload = {
      ...form,
      images: form.images.filter((u) => u.trim()),
      variants: form.variants.filter((v) => v.size),
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    }
    const url = isEdit ? `/api/admin/products/${form.id}` : '/api/admin/products'
    const method = isEdit ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setSaving(false)
    if (data.success || data.id) {
      toast.success(isEdit ? 'Product updated!' : 'Product created!')
      if (!isEdit && data.id) router.push(`/admin/products/${data.id}`)
      else router.refresh()
    } else {
      toast.error(data.error ?? 'Save failed')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    setDeleting(true)
    const res = await fetch(`/api/admin/products/${form.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (res.ok) {
      toast.success('Product deleted')
      router.push('/admin/products')
    } else {
      toast.error('Delete failed')
    }
  }

  const addImage = () => setForm((f) => ({ ...f, images: [...f.images, ''] }))
  const removeImage = (i: number) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))
  const updateImage = (i: number, val: string) => setForm((f) => {
    const imgs = [...f.images]; imgs[i] = val; return { ...f, images: imgs }
  })

  const updateVariant = (i: number, key: keyof Variant, val: string | number) => setForm((f) => {
    const variants = [...f.variants]; variants[i] = { ...variants[i], [key]: val }; return { ...f, variants }
  })

  const TABS = [
    { key: 'general', label: 'General' },
    { key: 'media', label: 'Media' },
    { key: 'variants', label: 'Variants & Stock' },
    { key: 'seo', label: 'SEO' },
  ] as const

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-black" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
            {isEdit ? form.name || 'Edit Product' : 'Add New Product'}
          </h1>
          {isEdit && (
            <p className="text-[12px] mt-0.5 font-mono" style={{ color: 'var(--fg-sub)' }}>/{form.slug}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEdit && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-xl text-[13px] font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: 'rgba(232,25,44,0.1)', color: 'var(--red)', border: '1px solid rgba(232,25,44,0.2)', fontFamily: 'var(--font-inter)' }}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-[13px] font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>

      {/* Status toggles */}
      <div className="flex gap-3 mb-6">
        {([
          { key: 'is_active', label: 'Active', color: 'var(--green)' },
          { key: 'is_featured', label: 'Featured', color: 'var(--gold)' },
          { key: 'is_new_arrival', label: 'New Arrival', color: 'var(--blue)' },
        ] as { key: keyof ProductData; label: string; color: string }[]).map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => set(key, !form[key])}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all"
            style={{
              background: form[key] ? `${color}18` : 'var(--bg-raised)',
              border: `1px solid ${form[key] ? color + '44' : 'var(--border)'}`,
              color: form[key] ? color : 'var(--fg-sub)',
              fontFamily: 'var(--font-inter)',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: form[key] ? color : 'var(--border)' }} />
            {label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 mb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="px-4 py-2.5 text-[13px] font-medium transition-colors -mb-px"
            style={{
              color: activeTab === key ? 'var(--fg)' : 'var(--fg-muted)',
              borderBottom: activeTab === key ? '2px solid var(--red)' : '2px solid transparent',
              fontFamily: 'var(--font-inter)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── GENERAL TAB ── */}
      {activeTab === 'general' && (
        <div className="space-y-5">
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-4" style={labelStyle}>Basic Info</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Product Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Real Madrid Home Jersey 2025-26"
                  className="w-full px-3 py-2.5 rounded-xl text-[14px] outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>URL Slug *</label>
                <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <span className="px-3 py-2.5 text-[12px]" style={{ background: 'var(--bg)', color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)', borderRight: '1px solid var(--border)' }}>
                    /shop/
                  </span>
                  <input
                    value={form.slug}
                    onChange={(e) => set('slug', e.target.value)}
                    className="flex-1 px-3 py-2.5 text-[13px] outline-none"
                    style={{ background: 'var(--bg-raised)', color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Describe the product…"
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none resize-none"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-4" style={labelStyle}>Pricing</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'base_price', label: 'Selling Price (₹) *' },
                { key: 'compare_price', label: 'Compare at Price (₹)' },
                { key: 'cost_price', label: 'Cost Price (₹)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>{label}</label>
                  <input
                    type="number"
                    value={(form as unknown as Record<string, unknown>)[key] as string}
                    onChange={(e) => set(key as keyof ProductData, e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
            {form.compare_price && form.base_price && Number(form.compare_price) > Number(form.base_price) && (
              <p className="mt-2 text-[12px]" style={{ color: 'var(--green)', fontFamily: 'var(--font-inter)' }}>
                {Math.round((1 - Number(form.base_price) / Number(form.compare_price)) * 100)}% off
                {form.cost_price && Number(form.cost_price) > 0 && ` · Margin: ₹${Number(form.base_price) - Number(form.cost_price)}`}
              </p>
            )}
          </div>

          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-4" style={labelStyle}>Product Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Team</label>
                <select
                  value={form.team_id}
                  onChange={(e) => set('team_id', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                  style={inputStyle}
                >
                  <option value="">— No Team —</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Season</label>
                <input
                  value={form.season}
                  onChange={(e) => set('season', e.target.value)}
                  placeholder="e.g. 2025-26"
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Jersey Type</label>
                <select
                  value={form.jersey_type}
                  onChange={(e) => set('jersey_type', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                  style={inputStyle}
                >
                  {JERSEY_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Edition</label>
                <select
                  value={form.edition}
                  onChange={(e) => set('edition', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                  style={inputStyle}
                >
                  {EDITIONS.map((e) => (
                    <option key={e} value={e}>{e.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Player Name</label>
                <input
                  value={form.player_name}
                  onChange={(e) => set('player_name', e.target.value)}
                  placeholder="e.g. MBAPPE"
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Player Number</label>
                <input
                  value={form.player_number}
                  onChange={(e) => set('player_number', e.target.value)}
                  placeholder="e.g. 9"
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                  style={inputStyle}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Tags (comma separated)</label>
              <input
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="e.g. football, real-madrid, 2025-26"
                className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── MEDIA TAB ── */}
      {activeTab === 'media' && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold uppercase tracking-wider" style={labelStyle}>Product Images</p>
            <button
              onClick={addImage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
            >
              <ImagePlus size={13} /> Add Image
            </button>
          </div>
          <p className="text-[11px] mb-4" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
            First image is the primary/thumbnail. Paste image URLs (CDN, Shopify, Supabase, etc.)
          </p>
          <div className="space-y-3">
            {form.images.map((url, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div
                  className="w-16 h-16 rounded-xl shrink-0 overflow-hidden flex items-center justify-center"
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
                >
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <span className="text-xl">🖼</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    value={url}
                    onChange={(e) => updateImage(i, e.target.value)}
                    placeholder={i === 0 ? 'Primary image URL (required)' : `Image ${i + 1} URL`}
                    className="w-full px-3 py-2.5 rounded-xl text-[12px] outline-none font-mono"
                    style={inputStyle}
                  />
                  {i === 0 && <p className="text-[10px] mt-1" style={{ color: 'var(--green)', fontFamily: 'var(--font-inter)' }}>Primary image</p>}
                </div>
                {form.images.length > 1 && (
                  <button onClick={() => removeImage(i)} className="mt-2" style={{ color: 'var(--red)' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VARIANTS TAB ── */}
      {activeTab === 'variants' && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={labelStyle}>Size Variants & Stock</p>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Size', 'SKU', 'Stock Qty', 'Extra Price (₹)', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {form.variants.map((v, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-5 py-2.5">
                    <select
                      value={v.size}
                      onChange={(e) => updateVariant(i, 'size', e.target.value)}
                      className="px-2 py-1.5 rounded-lg text-[12px] outline-none"
                      style={inputStyle}
                    >
                      {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-2.5">
                    <input
                      value={v.sku}
                      onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                      placeholder={`${form.slug || 'product'}-${v.size.toLowerCase()}`}
                      className="w-full px-2 py-1.5 rounded-lg text-[12px] outline-none font-mono"
                      style={inputStyle}
                    />
                  </td>
                  <td className="px-5 py-2.5">
                    <input
                      type="number"
                      value={v.stock_quantity}
                      onChange={(e) => updateVariant(i, 'stock_quantity', Number(e.target.value))}
                      className="w-20 px-2 py-1.5 rounded-lg text-[12px] outline-none"
                      style={{ ...inputStyle, color: v.stock_quantity <= 5 ? 'var(--red)' : 'var(--fg)' }}
                    />
                  </td>
                  <td className="px-5 py-2.5">
                    <input
                      type="number"
                      value={v.additional_price}
                      onChange={(e) => updateVariant(i, 'additional_price', Number(e.target.value))}
                      className="w-20 px-2 py-1.5 rounded-lg text-[12px] outline-none"
                      style={inputStyle}
                    />
                  </td>
                  <td className="px-5 py-2.5">
                    <button
                      onClick={() => setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }))}
                      style={{ color: 'var(--red)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => setForm((f) => ({ ...f, variants: [...f.variants, { size: 'S', stock_quantity: 0, additional_price: 0, sku: '' }] }))}
              className="flex items-center gap-1.5 text-[12px] font-medium"
              style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
            >
              <Plus size={13} /> Add Size
            </button>
          </div>
        </div>
      )}

      {/* ── SEO TAB ── */}
      {activeTab === 'seo' && (
        <div className="rounded-2xl p-5 space-y-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-[11px] font-bold uppercase tracking-wider" style={labelStyle}>Search Engine Optimization</p>

          {/* Google preview */}
          <div className="rounded-xl p-4" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>Google Preview</p>
            <p className="text-[14px] font-medium" style={{ color: '#1a0dab', fontFamily: 'var(--font-inter)' }}>
              {form.meta_title || form.name || 'Product Title'}
            </p>
            <p className="text-[12px]" style={{ color: '#006621', fontFamily: 'var(--font-inter)' }}>
              jerseywala.com/shop/{form.slug || 'product-slug'}
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
              {form.meta_description || form.description || 'Add a meta description for this product…'}
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>
              Meta Title <span style={{ color: 'var(--fg-sub)' }}>({(form.meta_title || form.name).length}/70)</span>
            </label>
            <input
              value={form.meta_title}
              onChange={(e) => set('meta_title', e.target.value)}
              placeholder={form.name || 'SEO title'}
              maxLength={70}
              className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
              style={inputStyle}
            />
            <div className="h-1 mt-1.5 rounded-full" style={{ background: 'var(--bg-raised)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(((form.meta_title || form.name).length / 70) * 100, 100)}%`,
                  background: (form.meta_title || form.name).length > 60 ? 'var(--green)' : 'var(--gold)',
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>
              Meta Description <span style={{ color: 'var(--fg-sub)' }}>({(form.meta_description || form.description).length}/160)</span>
            </label>
            <textarea
              value={form.meta_description}
              onChange={(e) => set('meta_description', e.target.value)}
              placeholder={form.description || 'SEO description (160 chars recommended)'}
              maxLength={160}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none resize-none"
              style={inputStyle}
            />
            <div className="h-1 mt-1.5 rounded-full" style={{ background: 'var(--bg-raised)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(((form.meta_description || form.description).length / 160) * 100, 100)}%`,
                  background: (form.meta_description || form.description).length > 130 ? 'var(--green)' : 'var(--gold)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Save button at bottom */}
      <div className="flex justify-end mt-6 pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 rounded-xl text-[14px] font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </div>
  )
}
