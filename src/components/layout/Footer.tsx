import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-2.5 mb-5">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-lg"
              style={{ background: 'var(--red)' }}
            >
              <span className="text-white text-[11px] font-bold tracking-widest">JW</span>
            </div>
            <span
              className="text-[14px] font-semibold tracking-tight"
              style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}
            >
              The Jersey Wala
            </span>
          </Link>
          <p className="text-[13px] leading-relaxed max-w-[180px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
            India&apos;s destination for authentic sports jerseys. Est. 2025.
          </p>
          <div className="flex gap-2 mt-5">
            {['FB', 'IG', 'X', 'YT'].map((s) => (
              <a
                key={s}
                href="#"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-semibold transition-colors"
                style={{
                  background: 'var(--bg-raised)',
                  color: 'var(--fg-muted)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4
            className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-5"
            style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}
          >
            Shop
          </h4>
          <div className="space-y-3">
            {[
              { label: 'Football Jerseys', href: '/sport/football' },
              { label: 'Cricket Jerseys', href: '/sport/cricket' },
              { label: 'IPL Jerseys', href: '/sport/ipl' },
              { label: 'New Arrivals', href: '/shop?new=true' },
              { label: 'Sale', href: '/shop?deals=true' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-[13px] transition-colors"
                style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Help */}
        <div>
          <h4
            className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-5"
            style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}
          >
            Help
          </h4>
          <div className="space-y-3">
            {[
              { label: 'Track Your Order', href: '/orders' },
              { label: 'Returns & Exchange', href: '#' },
              { label: 'Size Guide', href: '#' },
              { label: 'FAQ', href: '#' },
              { label: 'Contact Us', href: '#' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block text-[13px] transition-colors"
                style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4
            className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-5"
            style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}
          >
            Contact
          </h4>
          <div className="space-y-3 text-[13px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
            <p>hello@thejerseywala.in</p>
            <p>+91 98765 43210</p>
            <p>Gurugram, Haryana</p>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-5">
            {['UPI', 'VISA', 'MC', 'GPay', 'PhonePe'].map((p) => (
              <span
                key={p}
                className="text-[10px] px-2 py-1 rounded-md font-medium"
                style={{
                  background: 'var(--bg-raised)',
                  color: 'var(--fg-muted)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }} className="py-5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
            © 2025 The Jersey Wala. All rights reserved.
          </p>
          <div className="flex gap-5">
            {['Privacy Policy', 'Terms', 'Sitemap'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[12px] transition-colors"
                style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
