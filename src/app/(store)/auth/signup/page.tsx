'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Please check your email to confirm.')
      router.push('/auth/login')
    }
  }

  const fields = [
    { label: 'Full Name', type: 'text', key: 'full_name' as const, placeholder: 'Your name' },
    { label: 'Email', type: 'email', key: 'email' as const, placeholder: 'you@example.com' },
    { label: 'Password', type: 'password', key: 'password' as const, placeholder: 'At least 6 characters' },
  ]

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="text-center mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'var(--red)' }}
          >
            <span className="text-white font-bold text-lg">JW</span>
          </div>
          <h1 className="text-2xl font-black" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
            Create Account
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
            Join Jersey Wala and start shopping
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {fields.map(({ label, type, key, placeholder }) => (
            <div key={key}>
              <label
                className="block text-[11px] font-medium uppercase tracking-[0.04em] mb-1.5"
                style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
              >
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
                minLength={key === 'password' ? 6 : undefined}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl text-[13px] outline-none transition-colors"
                style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border)',
                  color: 'var(--fg)',
                  fontFamily: 'var(--font-inter)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--fg-sub)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-[14px] transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-[13px] mt-4" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium hover:underline" style={{ color: 'var(--red)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
