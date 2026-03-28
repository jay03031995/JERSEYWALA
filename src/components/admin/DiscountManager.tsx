'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { DiscountCode } from '@/types/database'
import { Plus, X } from 'lucide-react'

const EMPTY = {
  code: '', discount_type: 'percentage' as const,
  discount_value: 10, minimum_order: 0, max_uses: '',
}

export default function DiscountManager({ initialCodes }: { initialCodes: DiscountCode[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        discount_value: Number(form.discount_value),
        minimum_order: Number(form.minimum_order),
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        code: form.code.toUpperCase(),
      }),
    })
    setSaving(false)
    if (res.ok) {
      toast.success('Discount code created')
      setForm(EMPTY)
      setShowForm(false)
      router.refresh()
    } else {
      const { error } = await res.json()
      toast.error(error ?? 'Failed to create code')
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    const res = await fetch(`/api/admin/discounts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive }),
    })
    if (res.ok) { toast.success(isActive ? 'Code deactivated' : 'Code activated'); router.refresh() }
    else toast.error('Failed to update code')
  }

  return (
    <div className="space-y-4">
      {/* Create button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-opacity hover:opacity-90"
        style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
      >
        {showForm ? <X size={14} /> : <Plus size={14} />}
        {showForm ? 'Cancel' : 'New Code'}
      </button>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl p-5 space-y-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <p
            className="text-[12px] font-semibold uppercase tracking-[0.06em]"
            style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
          >
            New Discount Code
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Code', key: 'code', placeholder: 'IPL2026', type: 'text' },
              { label: 'Min. Order (₹)', key: 'minimum_order', placeholder: '0', type: 'number' },
              { label: 'Discount Value', key: 'discount_value', placeholder: '10', type: 'number' },
              { label: 'Max Uses (blank = unlimited)', key: 'max_uses', placeholder: '100', type: 'number' },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label
                  className="block text-[11px] font-medium uppercase tracking-[0.04em] mb-1"
                  style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => set(key as keyof typeof form)(e.target.value)}
                  required={key !== 'max_uses'}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                  style={{
                    background: 'var(--bg-raised)',
                    border: '1px solid var(--border)',
                    color: 'var(--fg)',
                    fontFamily: 'var(--font-inter)',
                  }}
                />
              </div>
            ))}
            <div>
              <label
                className="block text-[11px] font-medium uppercase tracking-[0.04em] mb-1"
                style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
              >
                Type
              </label>
              <select
                value={form.discount_type}
                onChange={(e) => set('discount_type')(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border)',
                  color: 'var(--fg)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-[13px] font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
          >
            {saving ? 'Creating…' : 'Create Code'}
          </button>
        </form>
      )}

      {/* Codes table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Code', 'Type', 'Value', 'Min Order', 'Uses', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em]"
                    style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {initialCodes.map((code) => (
                <tr key={code.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-5 py-3">
                    <p className="text-[13px] font-bold font-mono" style={{ color: 'var(--fg)' }}>
                      {code.code}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[12px] capitalize" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                      {code.discount_type}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
                      {code.discount_type === 'percentage' ? `${code.discount_value}%` : `₹${code.discount_value}`}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                      ₹{code.minimum_order}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                      {code.used_count} / {code.max_uses ?? '∞'}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{
                        background: code.is_active ? 'rgba(57,255,20,0.1)' : 'rgba(255,255,255,0.06)',
                        color: code.is_active ? 'var(--green)' : 'var(--fg-sub)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      {code.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggle(code.id, code.is_active)}
                      className="text-[11px] font-medium"
                      style={{ color: code.is_active ? 'var(--red)' : 'var(--green)', fontFamily: 'var(--font-inter)' }}
                    >
                      {code.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {initialCodes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[13px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                    No discount codes yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
