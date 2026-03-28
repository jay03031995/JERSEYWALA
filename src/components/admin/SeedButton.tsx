'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Database } from 'lucide-react'

export default function SeedButton({ label, endpoint }: { label: string; endpoint: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSeed = async () => {
    setLoading(true)
    const t = toast.loading('Seeding data…')
    const res = await fetch(endpoint, { method: 'POST' })
    const data = await res.json()
    toast.dismiss(t)
    setLoading(false)
    if (data.success) {
      toast.success(data.results?.join(' · ') ?? 'Done!')
      router.refresh()
    } else {
      toast.error(data.error ?? 'Seed failed')
    }
  }

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
      style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        color: 'var(--fg-muted)',
        fontFamily: 'var(--font-inter)',
      }}
    >
      <Database size={13} />
      {loading ? 'Seeding…' : label}
    </button>
  )
}
