import { MessageCircle } from 'lucide-react'

// Renders only when a WhatsApp number/link is configured in store settings.
// Accepts either a full channel/invite URL or a bare phone number.
export default function WhatsAppCommunity({ whatsapp }: { whatsapp?: string }) {
  if (!whatsapp || !whatsapp.trim()) return null

  const raw = whatsapp.trim()
  const href = raw.startsWith('http')
    ? raw
    : `https://wa.me/${raw.replace(/[^0-9]/g, '')}`

  const perks = [
    'Early access to new drops',
    'Exclusive discounts & flash sales',
    'Match-day offers',
    'Giveaways & limited editions',
  ]

  return (
    <section style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14">
        <div
          className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #128C3E 0%, #25D366 100%)' }}
        >
          <div className="relative z-10 flex flex-col items-center">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl mb-5"
              style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}
            >
              <MessageCircle size={26} />
            </span>
            <h2
              className="text-white text-[30px] sm:text-[40px] font-bold uppercase leading-none mb-3"
              style={{ fontFamily: 'var(--font-oswald)', letterSpacing: '-0.02em' }}
            >
              Join Our WhatsApp Community
            </h2>
            <p
              className="text-[14px] sm:text-[15px] mb-6 max-w-lg"
              style={{ color: 'rgba(255,255,255,0.92)', fontFamily: 'var(--font-inter)' }}
            >
              Be the first to know. Drops, discounts and match-day offers — straight to your phone.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {perks.map((p) => (
                <span
                  key={p}
                  className="text-[12px] font-medium px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', fontFamily: 'var(--font-inter)' }}
                >
                  {p}
                </span>
              ))}
            </div>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-bold transition-transform hover:scale-[1.03]"
              style={{ background: '#fff', color: '#128C3E', fontFamily: 'var(--font-inter)' }}
            >
              <MessageCircle size={18} /> Join WhatsApp Channel
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
