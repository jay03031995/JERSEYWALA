import { BadgeCheck, Truck, PenLine, RotateCcw, Headphones } from 'lucide-react'
import SectionHeader from '@/components/home/SectionHeader'

type Props = {
  freeShippingThreshold?: string
  returnDays?: string
}

// Trust / value-proposition strip. Copy adapts to real store settings
// (free-shipping threshold, return window) where available.
export default function WhyChoose({ freeShippingThreshold, returnDays }: Props) {
  const items = [
    { icon: BadgeCheck, title: 'Premium Quality', desc: 'Match-grade fabric & official-style prints.' },
    { icon: BadgeCheck, title: 'Official Merchandise', desc: 'Licensed jerseys and trusted fanwear.' },
    { icon: PenLine, title: 'Custom Made & Printed', desc: 'Personalise your jersey, your way.' },
    {
      icon: Truck,
      title: 'Fast & Safe Shipping',
      desc: freeShippingThreshold
        ? `Free delivery over ₹${freeShippingThreshold}.`
        : 'Quick, tracked delivery nationwide.',
    },
    { icon: Headphones, title: '24/7 Support', desc: 'Real people, real help on WhatsApp.' },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      desc: returnDays ? `Hassle-free ${returnDays}-day returns.` : 'Simple, hassle-free returns.',
    },
  ]

  return (
    <section className="home-promise">
      <div className="site-container">
        <SectionHeader eyebrow="The Jersey Wala promise" title="Why Fans Choose Us" compact />

        <div className="home-promise__grid">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="home-promise__item"
            >
              <span className="home-promise__icon">
                <Icon size={20} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
