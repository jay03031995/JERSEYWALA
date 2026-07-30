import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type SectionHeaderProps = {
  eyebrow: string
  title: string
  description?: string
  href?: string
  action?: string
  id?: string
  compact?: boolean
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  action = 'View all',
  id,
  compact = false,
}: SectionHeaderProps) {
  return (
    <header className={`section-header${compact ? ' section-header--compact' : ''}`}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="section-title">{title}</h2>
        {description && <p className="section-copy">{description}</p>}
      </div>
      {href && (
        <Link className="section-action" href={href}>
          {action}
          <ArrowRight aria-hidden="true" size={15} />
        </Link>
      )}
    </header>
  )
}
