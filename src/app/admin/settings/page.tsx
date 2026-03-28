import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdminClient()
  const { data: profile } = user
    ? await admin.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }

  const delhiveryConfigured = !!process.env.DELHIVERY_API_TOKEN
  const razorpayConfigured = !!process.env.RAZORPAY_KEY_ID

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] font-black" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
          Settings
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
          Store configuration & integrations
        </p>
      </div>

      {/* Profile */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em] mb-4" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
          Admin Profile
        </p>
        <div className="grid grid-cols-2 gap-4 text-[13px]" style={{ fontFamily: 'var(--font-inter)', color: 'var(--fg-muted)' }}>
          <div>
            <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'var(--fg-sub)' }}>Name</p>
            <p style={{ color: 'var(--fg)' }}>{profile?.full_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'var(--fg-sub)' }}>Email</p>
            <p style={{ color: 'var(--fg)' }}>{profile?.email ?? user?.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'var(--fg-sub)' }}>Role</p>
            <p className="capitalize" style={{ color: 'var(--fg)' }}>{profile?.role?.replace('_', ' ') ?? '—'}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'var(--fg-sub)' }}>Phone</p>
            <p style={{ color: 'var(--fg)' }}>{profile?.phone ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em] mb-4" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
          Integrations
        </p>
        <div className="space-y-3">
          {[
            { name: 'Razorpay (Payments)', env: 'RAZORPAY_KEY_ID', configured: razorpayConfigured, desc: 'Payment gateway for UPI, cards, wallets' },
            { name: 'Delhivery (Shipping)', env: 'DELHIVERY_API_TOKEN', configured: delhiveryConfigured, desc: 'Real-time shipment tracking API' },
            { name: 'Supabase (Database)', env: 'NEXT_PUBLIC_SUPABASE_URL', configured: true, desc: 'Database & auth' },
          ].map(({ name, env, configured, desc }) => (
            <div
              key={name}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
            >
              <div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}>{name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>{desc}</p>
                <p className="text-[10px] mt-0.5 font-mono" style={{ color: 'var(--fg-sub)' }}>{env}</p>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{
                  background: configured ? 'rgba(57,255,20,0.1)' : 'rgba(232,25,44,0.1)',
                  color: configured ? 'var(--green)' : 'var(--red)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {configured ? '✓ Connected' : '✗ Not set'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Delhivery setup instructions */}
      {!delhiveryConfigured && (
        <div className="rounded-2xl p-5 mb-5" style={{ background: 'rgba(245,197,24,0.05)', border: '1px solid rgba(245,197,24,0.2)' }}>
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] mb-3" style={{ color: 'var(--gold)', fontFamily: 'var(--font-inter)' }}>
            Setup Delhivery Tracking
          </p>
          <ol className="space-y-2 text-[12px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
            <li>1. Create account at <strong style={{ color: 'var(--fg)' }}>delhivery.com</strong></li>
            <li>2. Go to Settings → API → Generate token</li>
            <li>3. Add to <code className="px-1.5 py-0.5 rounded text-[11px]" style={{ background: 'var(--bg-raised)', color: 'var(--fg)' }}>.env.local</code>:
              <code className="block mt-1 px-3 py-2 rounded-lg text-[11px]" style={{ background: 'var(--bg-raised)', color: 'var(--green)' }}>
                DELHIVERY_API_TOKEN=your_token_here
              </code>
            </li>
            <li>4. Restart the dev server</li>
          </ol>
        </div>
      )}

      {/* Store Info */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em] mb-4" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
          Store Information
        </p>
        <div className="grid grid-cols-2 gap-4 text-[13px]" style={{ fontFamily: 'var(--font-inter)', color: 'var(--fg-muted)' }}>
          {[
            { label: 'Store Name', value: 'The Jersey Wala' },
            { label: 'Support Email', value: 'support@jerseywala.com' },
            { label: 'Free Shipping Above', value: '₹999' },
            { label: 'Flat Shipping Fee', value: '₹99' },
            { label: 'Currency', value: 'INR (₹)' },
            { label: 'Return Window', value: '7 days' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'var(--fg-sub)' }}>{label}</p>
              <p style={{ color: 'var(--fg)' }}>{value}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] mt-4" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
          To edit store settings, update constants in <code style={{ color: 'var(--fg-muted)' }}>src/lib/config.ts</code>
        </p>
      </div>
    </div>
  )
}
