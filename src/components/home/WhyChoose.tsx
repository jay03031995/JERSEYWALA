import { BadgeCheck, Truck, PenLine, ShieldCheck, RotateCcw, Headphones } from 'lucide-react'

type Props = {
  freeShippingThreshold?: string
  returnDays?: string
}

// Trust / value-proposition strip. Copy adapts to real store settings
// (free-shipping threshold, return window) where available.
export default function WhyChoose({ freeShippingThreshold, returnDays }: Props) {
  const items = [
    { icon: BadgeCheck, title: 'Premium Quality', desc: 'Match-grade fabric & official-style prints.' },
    { icon: PenLine, title: 'Custom Name & Number', desc: 'Personalise any jersey, your way.' },
    {
      icon: Truck,
      title: 'Fast India Shipping',
      desc: freeShippingThreshold
        ? `Free delivery over ₹${freeShippingThreshold}.`
        : 'Quick, tracked delivery nationwide.',
    },
    { icon: ShieldCheck, title: 'Secure Payments', desc: 'UPI, cards & wallets — 100% protected.' },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      desc: returnDays ? `Hassle-free ${returnDays}-day returns.` : 'Simple, hassle-free returns.',
    },
    { icon: Headphones, title: 'Fan Support', desc: 'Real people, real help on WhatsApp.' },
  ]

  return (
    <section className="home-promise" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center mb-10">
          <p
            className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-2"
            style={{ color: 'var(--red)', fontFamily: 'var(--font-inter)' }}
          >
            The Jersey Wala Promise
          </p>
          <h2
            className="text-[32px] sm:text-[40px] font-bold uppercase leading-none"
            style={{ fontFamily: 'var(--font-oswald)', letterSpacing: '-0.02em', color: 'var(--fg)' }}
          >
            Why Fans Choose Us
          </h2>
        </div>

        <div className="home-promise__grid">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="home-promise__item"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'color-mix(in srgb, var(--red) 12%, transparent)', color: 'var(--red)' }}
              >
                <Icon size={20} />
              </span>
              <div>
                <h3 className="text-[15px] font-bold" style={{ color: 'var(--fg)', fontFamily: 'var(--font-oswald)' }}>
                  {title}
                </h3>
                <p className="text-[12.5px] mt-1 leading-snug" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
