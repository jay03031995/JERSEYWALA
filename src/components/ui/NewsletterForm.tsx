'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowRight } from 'lucide-react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      toast.success('Subscribed.')
      setEmail('')
    }
  }

  return (
    <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 px-4 py-3 rounded-xl text-[14px] focus:outline-none transition"
        style={{
          background: 'var(--bg-raised)',
          color: 'var(--fg)',
          border: '1px solid var(--border)',
          fontFamily: 'var(--font-inter)',
        }}
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[13px] font-semibold transition-all hover:opacity-90 shrink-0"
        style={{
          background: 'var(--fg)',
          color: 'var(--bg)',
          fontFamily: 'var(--font-inter)',
        }}
      >
        Subscribe <ArrowRight size={13} />
      </button>
    </form>
  )
}
