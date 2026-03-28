'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Package, Warehouse,
  Tag, LogOut, ChevronRight, Users, BarChart2, Settings,
  Megaphone, FileText,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Inventory', href: '/admin/inventory', icon: Warehouse },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Discounts', href: '/admin/discounts', icon: Tag },
  { label: 'Popups & Banners', href: '/admin/popups', icon: Megaphone },
  { label: 'Store Content', href: '/admin/content', icon: FileText },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar({ userName, role }: { userName: string; role: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside
      className="w-[220px] shrink-0 flex flex-col h-full"
      style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}
    >
      {/* Brand */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--red)' }}
          >
            <span className="text-white font-bold text-[11px] tracking-widest">JW</span>
          </div>
          <div>
            <p className="text-[13px] font-bold leading-tight" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
              Jersey Wala
            </p>
            <p className="text-[10px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
              Admin Panel
            </p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all"
              style={{
                background: active ? 'rgba(232,25,44,0.1)' : 'transparent',
                color: active ? 'var(--red)' : 'var(--fg-muted)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              <Icon size={15} />
              {label}
              {active && <ChevronRight size={12} className="ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="mb-3">
          <p className="text-[12px] font-medium truncate" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>
            {userName}
          </p>
          <p className="text-[10px] capitalize" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
            {role.replace('_', ' ')}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[12px] font-medium w-full px-3 py-2 rounded-lg transition-colors"
          style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--red)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-muted)' }}
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
