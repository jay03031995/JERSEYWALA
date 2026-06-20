import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, Heart, ShieldCheck, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/account/SignOutButton'

export const metadata = { title: 'My Account — Jersey Wala' }

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .single()

  const name = profile?.full_name ?? profile?.email ?? user.email ?? 'Account'
  const email = profile?.email ?? user.email ?? ''
  const isAdmin = profile && ['admin', 'super_admin'].includes(profile.role)

  const links = [
    { href: '/orders', label: 'My Orders', desc: 'Track and review your purchases', icon: Package },
    { href: '/account/wishlist', label: 'Wishlist', desc: 'Items you saved for later', icon: Heart },
    ...(isAdmin
      ? [{ href: '/admin', label: 'Admin Dashboard', desc: 'Manage the store', icon: ShieldCheck }]
      : []),
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <h1
        className="text-3xl font-black mb-2"
        style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
      >
        My Account
      </h1>
      <p className="text-[13px] mb-8" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
        {name}{email && name !== email ? ` · ${email}` : ''}
      </p>

      <div className="space-y-3">
        {links.map(({ href, label, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-2xl p-5 transition-colors"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'var(--bg)', color: 'var(--fg)' }}
            >
              <Icon size={18} />
            </span>
            <span className="flex-1">
              <span className="block font-bold text-[14px]" style={{ color: 'var(--fg)', fontFamily: 'var(--font-oswald)' }}>
                {label}
              </span>
              <span className="block text-[12px] mt-0.5" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                {desc}
              </span>
            </span>
            <ChevronRight size={16} style={{ color: 'var(--fg-sub)' }} />
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <SignOutButton />
      </div>
    </div>
  )
}
