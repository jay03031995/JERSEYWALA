import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const IPL_TEAMS = [
  { name: 'Mumbai Indians', slug: 'mumbai-indians', short: 'MI', color: '#004BA0', textDark: false },
  { name: 'Chennai Super Kings', slug: 'chennai-super-kings', short: 'CSK', color: '#FDB913', textDark: true },
  { name: 'Royal Challengers', slug: 'royal-challengers-bangalore', short: 'RCB', color: '#EC1C24', textDark: false },
  { name: 'Kolkata Knight Riders', slug: 'kolkata-knight-riders', short: 'KKR', color: '#3A225D', textDark: false },
  { name: 'Delhi Capitals', slug: 'delhi-capitals', short: 'DC', color: '#0078BC', textDark: false },
  { name: 'Rajasthan Royals', slug: 'rajasthan-royals', short: 'RR', color: '#E8218C', textDark: false },
  { name: 'Sunrisers Hyderabad', slug: 'sunrisers-hyderabad', short: 'SRH', color: '#F26522', textDark: false },
  { name: 'Punjab Kings', slug: 'punjab-kings', short: 'PBKS', color: '#DD1F2D', textDark: false },
  { name: 'Gujarat Titans', slug: 'gujarat-titans', short: 'GT', color: '#B5985A', textDark: false },
  { name: 'Lucknow Super Giants', slug: 'lucknow-super-giants', short: 'LSG', color: '#A2DAFF', textDark: true },
]

export default function TeamPromoGrid() {
  return (
    <section style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p
              className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-2"
              style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
            >
              IPL 2026
            </p>
            <h2
              className="text-[40px] font-bold uppercase"
              style={{ fontFamily: 'var(--font-oswald)', letterSpacing: '-0.02em' }}
            >
              Shop by Team
            </h2>
          </div>
          <Link
            href="/sport/ipl"
            className="text-[13px] font-medium flex items-center gap-1"
            style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
          >
            All IPL <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {IPL_TEAMS.map((team) => (
            <Link
              key={team.slug}
              href={`/team/${team.slug}`}
              className="group relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden transition-all hover:scale-[1.02]"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Team color glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
                style={{
                  background: `radial-gradient(ellipse at center, ${team.color}22, transparent 70%)`,
                }}
              />

              {/* IPL 2026 badge */}
              <div
                className="absolute top-3 right-3 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--fg-sub)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                IPL 26
              </div>

              {/* Team logo */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center relative z-10 overflow-hidden"
                style={{ background: `${team.color}22`, border: `1px solid ${team.color}33` }}
              >
                <Image
                  src={`https://scores.iplt20.com/ipl/teamlogos/${team.short}.png`}
                  alt={`${team.name} logo`}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>

              <div className="relative z-10">
                <p
                  className="text-[13px] font-semibold leading-snug"
                  style={{ color: 'var(--fg)', fontFamily: 'var(--font-inter)' }}
                >
                  {team.name}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: team.color, fontFamily: 'var(--font-inter)' }}
                  >
                    Shop Now
                  </span>
                  <ArrowRight
                    size={10}
                    style={{ color: team.color }}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
