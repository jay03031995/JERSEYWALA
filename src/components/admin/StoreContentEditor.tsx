'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'

const inputStyle = {
  background: 'var(--bg-raised)',
  border: '1px solid var(--border)',
  color: 'var(--fg)',
  fontFamily: 'var(--font-inter)',
}
const labelStyle = { color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }

const DEFAULTS = {
  ticker_messages: [
    'Free delivery on orders above ₹999',
    'Use code JERSEY10 for 10% off',
    'IPL 2026 jerseys now available',
  ],
  store_name: 'The Jersey Wala',
  support_email: 'support@jerseywala.com',
  support_phone: '',
  free_shipping_threshold: '999',
  flat_shipping_fee: '99',
  return_policy_days: '7',
  footer_tagline: "India's home for official and replica sports jerseys.",
  footer_address: 'Mumbai, Maharashtra, India',
  instagram_url: '',
  twitter_url: '',
  facebook_url: '',
  whatsapp_number: '',
  nav_sports: 'Football, Cricket, IPL 2026',
  nav_leagues: 'Premier League, La Liga, IPL 2026, International Cricket',
  discount_code_hint: 'JERSEY10',
}

export default function StoreContentEditor() {
  const [form, setForm] = useState(DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'ticker' | 'store' | 'footer' | 'nav'>('ticker')

  const set = (key: keyof typeof DEFAULTS, val: string) =>
    setForm((f) => ({ ...f, [key]: val }))

  const setTicker = (i: number, val: string) =>
    setForm((f) => {
      const msgs = [...f.ticker_messages]
      msgs[i] = val
      return { ...f, ticker_messages: msgs }
    })
  const addTicker = () =>
    setForm((f) => ({ ...f, ticker_messages: [...f.ticker_messages, ''] }))
  const removeTicker = (i: number) =>
    setForm((f) => ({ ...f, ticker_messages: f.ticker_messages.filter((_, idx) => idx !== i) }))

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    toast.success('Settings saved!')
  }

  const TABS = [
    { key: 'ticker', label: 'Announcement Bar' },
    { key: 'store', label: 'Store Info' },
    { key: 'footer', label: 'Footer' },
    { key: 'nav', label: 'Navigation' },
  ] as const

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-0.5" style={{ borderBottom: '1px solid var(--border)' }}>
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

      {/* ── TICKER ── */}
      {activeTab === 'ticker' && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-[11px] font-bold uppercase tracking-wider" style={labelStyle}>Announcement Bar Messages</p>
          <p className="text-[12px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
            These scroll across the top of every page. Keep them short and punchy.
          </p>
          {form.ticker_messages.map((msg, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={msg}
                onChange={(e) => setTicker(i, e.target.value)}
                placeholder={`Message ${i + 1}`}
                className="flex-1 px-3 py-2.5 rounded-xl text-[13px] outline-none"
                style={inputStyle}
              />
              <button
                onClick={() => removeTicker(i)}
                className="px-2.5 py-1 rounded-lg text-[12px]"
                style={{ color: 'var(--red)' }}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={addTicker}
            className="text-[12px] font-medium px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
          >
            + Add Message
          </button>

          {/* Live preview */}
          <div>
            <p className="text-[10px] uppercase tracking-wider mb-2" style={labelStyle}>Preview</p>
            <div className="h-8 rounded-lg flex items-center overflow-hidden" style={{ background: 'var(--red)' }}>
              <p className="text-white text-[11px] font-semibold tracking-[0.08em] uppercase whitespace-nowrap px-4">
                {form.ticker_messages.filter(Boolean).join('  ·  ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── STORE INFO ── */}
      {activeTab === 'store' && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-[11px] font-bold uppercase tracking-wider" style={labelStyle}>Store Information</p>
          <div className="grid grid-cols-2 gap-4">
            {([
              { key: 'store_name', label: 'Store Name' },
              { key: 'support_email', label: 'Support Email' },
              { key: 'support_phone', label: 'Support Phone' },
              { key: 'whatsapp_number', label: 'WhatsApp Number' },
              { key: 'free_shipping_threshold', label: 'Free Shipping Above (₹)' },
              { key: 'flat_shipping_fee', label: 'Flat Shipping Fee (₹)' },
              { key: 'return_policy_days', label: 'Return Window (days)' },
              { key: 'discount_code_hint', label: 'Homepage Discount Code Hint' },
            ] as { key: keyof typeof DEFAULTS; label: string }[]).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>{label}</label>
                <input
                  value={form[key] as string}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                  style={inputStyle}
                />
              </div>
            ))}
          </div>

          <p className="text-[11px] font-bold uppercase tracking-wider pt-2" style={labelStyle}>Social Links</p>
          <div className="grid grid-cols-2 gap-4">
            {([
              { key: 'instagram_url', label: 'Instagram URL' },
              { key: 'twitter_url', label: 'Twitter / X URL' },
              { key: 'facebook_url', label: 'Facebook URL' },
              { key: 'whatsapp_number', label: 'WhatsApp Number' },
            ] as { key: keyof typeof DEFAULTS; label: string }[]).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>{label}</label>
                <input
                  value={form[key] as string}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-[12px] outline-none font-mono"
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      {activeTab === 'footer' && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-[11px] font-bold uppercase tracking-wider" style={labelStyle}>Footer Content</p>
          <div>
            <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Tagline</label>
            <input
              value={form.footer_tagline}
              onChange={(e) => set('footer_tagline', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>Address</label>
            <input
              value={form.footer_address}
              onChange={(e) => set('footer_address', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
              style={inputStyle}
            />
          </div>

          {/* Preview */}
          <div className="rounded-xl p-4 mt-2" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] uppercase tracking-wider mb-3" style={labelStyle}>Footer Preview</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--red)' }}>
                <span className="text-white font-bold text-[9px]">JW</span>
              </div>
              <p className="text-[14px] font-bold" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
                {form.store_name}
              </p>
            </div>
            <p className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>{form.footer_tagline}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>{form.footer_address}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>{form.support_email}</p>
          </div>
        </div>
      )}

      {/* ── NAV ── */}
      {activeTab === 'nav' && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-[11px] font-bold uppercase tracking-wider" style={labelStyle}>Navigation Links</p>
          <p className="text-[12px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
            Edit the comma-separated values below, then apply them to{' '}
            <code className="px-1.5 py-0.5 rounded text-[11px]" style={{ background: 'var(--bg-raised)', color: 'var(--fg)' }}>
              src/components/layout/Navbar.tsx
            </code>
          </p>
          {([
            { key: 'nav_sports', label: 'Sports Dropdown (comma separated)' },
            { key: 'nav_leagues', label: 'Leagues Dropdown (comma separated)' },
          ] as { key: keyof typeof DEFAULTS; label: string }[]).map(({ key, label }) => (
            <div key={key}>
              <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wider" style={labelStyle}>{label}</label>
              <input
                value={form[key] as string}
                onChange={(e) => set(key, e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                style={inputStyle}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(form[key] as string).split(',').filter(Boolean).map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-1 rounded-full text-[11px]"
                    style={{ background: 'var(--bg-raised)', color: 'var(--fg-muted)', border: '1px solid var(--border)', fontFamily: 'var(--font-inter)' }}
                  >
                    {item.trim()}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
        >
          <Save size={14} />
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
