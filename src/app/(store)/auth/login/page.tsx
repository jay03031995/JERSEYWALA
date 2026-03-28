'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setLoading(false)
      toast.error(error.message)
      return
    }
    toast.success('Welcome back!')
    // Check role — redirect admin to dashboard
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      if (profile && ['admin', 'super_admin'].includes(profile.role)) {
        router.push('/admin')
        router.refresh()
        return
      }
    }
    router.push('/')
    router.refresh()
  }

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
            Welcome Back
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
            Sign in to your Jersey Wala account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {[
            { label: 'Email', type: 'email', value: email, onChange: setEmail, placeholder: 'you@example.com' },
            { label: 'Password', type: 'password', value: password, onChange: setPassword, placeholder: '••••••••' },
          ].map(({ label, type, value, onChange, placeholder }) => (
            <div key={label}>
              <label
                className="block text-[11px] font-medium uppercase tracking-[0.04em] mb-1.5"
                style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
              >
                {label}
              </label>
              <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required
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
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[13px] mt-4" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-medium hover:underline" style={{ color: 'var(--red)' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
