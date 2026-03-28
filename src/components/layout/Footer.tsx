import Link from 'next/link'

// ─── Social SVGs ────────────────────────────────────────────────────────────

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 24 17" fill="currentColor">
      <path d="M23.495 2.633a3.003 3.003 0 00-2.114-2.128C19.505 0 12 0 12 0S4.495 0 2.619.505A3.003 3.003 0 00.505 2.633C0 4.52 0 8.5 0 8.5s0 3.98.505 5.867a3.003 3.003 0 002.114 2.128C4.495 17 12 17 12 17s7.505 0 9.381-.505a3.003 3.003 0 002.114-2.128C24 12.48 24 8.5 24 8.5s0-3.98-.505-5.867zM9.545 12.067V4.933L15.818 8.5l-6.273 3.567z" />
    </svg>
  )
}

// ─── Payment SVGs ────────────────────────────────────────────────────────────

function UPIIcon() {
  return (
    <svg width="34" height="14" viewBox="0 0 68 28" fill="none">
      <text x="0" y="20" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#097939">U</text>
      <text x="12" y="20" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#ed752e">P</text>
      <text x="24" y="20" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#097939">I</text>
      <polygon points="44,4 36,14 44,24 52,14" fill="#097939" />
      <polygon points="60,4 52,14 60,24 68,14" fill="#ed752e" />
    </svg>
  )
}

function VisaIcon() {
  return (
    <svg width="38" height="14" viewBox="0 0 750 471" fill="none">
      <rect width="750" height="471" rx="40" fill="white" fillOpacity="0.05" />
      <text x="375" y="320" textAnchor="middle" fontFamily="Arial" fontWeight="900" fontSize="280" fill="#1a1f71">VISA</text>
    </svg>
  )
}

function MastercardIcon() {
  return (
    <svg width="28" height="18" viewBox="0 0 38 24" fill="none">
      <circle cx="13" cy="12" r="12" fill="#EB001B" />
      <circle cx="25" cy="12" r="12" fill="#F79E1B" />
      <path d="M19 4.8a12 12 0 010 14.4A12 12 0 0119 4.8z" fill="#FF5F00" />
    </svg>
  )
}

function GPayIcon() {
  return (
    <svg width="34" height="14" viewBox="0 0 50 20" fill="none">
      <text x="0" y="15" fontFamily="Arial" fontWeight="bold" fontSize="15">
        <tspan fill="#4285F4">G</tspan>
        <tspan fill="#EA4335">o</tspan>
        <tspan fill="#FBBC04">o</tspan>
        <tspan fill="#4285F4">g</tspan>
        <tspan fill="#34A853">l</tspan>
        <tspan fill="#EA4335">e</tspan>
      </text>
    </svg>
  )
}

function PhonePeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#5f259f" />
      <text x="20" y="27" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="white">Pe</text>
    </svg>
  )
}

// ─── Social link config ──────────────────────────────────────────────────────

const SOCIAL = [
  { key: 'fb',  href: 'https://facebook.com/thejerseywala',  Icon: FacebookIcon,  label: 'Facebook',  color: '#1877F2' },
  { key: 'ig',  href: 'https://instagram.com/thejerseywala', Icon: InstagramIcon, label: 'Instagram', color: '#E1306C' },
  { key: 'x',   href: 'https://twitter.com/thejerseywala',   Icon: XIcon,         label: 'X',         color: '#fff' },
  { key: 'yt',  href: 'https://youtube.com/@thejerseywala',  Icon: YouTubeIcon,   label: 'YouTube',   color: '#FF0000' },
]

// ─── Component ───────────────────────────────────────────────────────────────

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
            India&apos;s destination for authentic sports jerseys. Est. 2026.
          </p>

          {/* Social icons */}
          <div className="flex gap-2 mt-5">
            {SOCIAL.map(({ key, href, Icon, label, color }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
                style={{
                  background: 'var(--bg-raised)',
                  color,
                  border: '1px solid var(--border)',
                }}
              >
                <Icon />
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
                className="block text-[13px] transition-colors hover:text-white"
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
                className="block text-[13px] transition-colors hover:text-white"
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

          {/* Payment icons */}
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <span
              className="flex items-center justify-center px-2 py-1 rounded-md"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
              title="UPI"
            >
              <UPIIcon />
            </span>
            <span
              className="flex items-center justify-center px-2 py-1 rounded-md"
              style={{ background: '#1a1f71', border: '1px solid var(--border)' }}
              title="Visa"
            >
              <VisaIcon />
            </span>
            <span
              className="flex items-center justify-center px-2 py-1 rounded-md"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
              title="Mastercard"
            >
              <MastercardIcon />
            </span>
            <span
              className="flex items-center justify-center px-2 py-1 rounded-md"
              style={{ background: 'white', border: '1px solid var(--border)' }}
              title="Google Pay"
            >
              <GPayIcon />
            </span>
            <span
              className="flex items-center justify-center px-1.5 py-1 rounded-md"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
              title="PhonePe"
            >
              <PhonePeIcon />
            </span>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }} className="py-5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
            © 2026 The Jersey Wala. All rights reserved.
          </p>
          <div className="flex gap-5">
            {['Privacy Policy', 'Terms', 'Sitemap'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[12px] transition-colors hover:text-white"
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
