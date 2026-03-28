'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function StockAdjuster({ variantId, current }: { variantId: string; current: number }) {
  const router = useRouter()
  const [value, setValue] = useState(String(current))
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const qty = parseInt(value)
    if (isNaN(qty) || qty < 0) { toast.error('Enter a valid quantity'); return }
    if (qty === current) return

    setSaving(true)
    const res = await fetch(`/api/admin/inventory/${variantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock_quantity: qty }),
    })
    setSaving(false)
    if (res.ok) { toast.success('Stock updated'); router.refresh() }
    else toast.error('Failed to update stock')
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 px-2 py-1.5 rounded-lg text-[12px] outline-none text-center"
        style={{
          background: 'var(--bg-raised)',
          border: '1px solid var(--border)',
          color: 'var(--fg)',
          fontFamily: 'var(--font-inter)',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--fg-sub)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
      />
      <button
        onClick={handleSave}
        disabled={saving || value === String(current)}
        className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
      >
        {saving ? '…' : 'Set'}
      </button>
    </div>
  )
}
