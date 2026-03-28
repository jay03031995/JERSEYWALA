interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
  className?: string
}

const STYLES: Record<string, { background: string; color: string; border?: string }> = {
  default: { background: 'rgba(255,255,255,0.08)', color: 'var(--fg-muted)' },
  success: { background: 'rgba(57,255,20,0.1)', color: 'var(--green)' },
  warning: { background: 'rgba(245,197,24,0.12)', color: 'var(--gold)' },
  danger:  { background: 'rgba(232,25,44,0.12)', color: 'var(--red)' },
  info:    { background: 'rgba(0,180,216,0.1)', color: 'var(--blue)' },
  outline: { background: 'transparent', color: 'var(--fg-muted)', border: '1px solid var(--border)' },
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const s = STYLES[variant]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className ?? ''}`}
      style={{
        background: s.background,
        color: s.color,
        border: s.border,
        fontFamily: 'var(--font-inter)',
      }}
    >
      {children}
    </span>
  )
}
