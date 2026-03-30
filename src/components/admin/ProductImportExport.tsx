'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Download, Upload } from 'lucide-react'

export default function ProductImportExport() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const router = useRouter()

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const t = toast.loading('Importing products…')
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/import/products', { method: 'POST', body: form })
    const data = await res.json()
    toast.dismiss(t)
    setImporting(false)
    if (data.success) {
      toast.success(`Imported ${data.count} products`)
      router.refresh()
    } else {
      toast.error(data.error ?? 'Import failed')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const btnStyle = {
    background: 'var(--bg-raised)',
    border: '1px solid var(--border)',
    color: 'var(--fg-muted)',
    fontFamily: 'var(--font-inter)',
  }

  return (
    <div className="flex items-center gap-2">
      {/* Export */}
      <a
        href="/api/admin/export/products"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-opacity hover:opacity-80"
        style={btnStyle}
      >
        <Download size={12} /> Export CSV
      </a>

      {/* Import */}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={importing}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
        style={btnStyle}
      >
        <Upload size={12} /> {importing ? 'Importing…' : 'Import CSV'}
      </button>
      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
    </div>
  )
}
