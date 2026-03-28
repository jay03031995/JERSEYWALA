'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  primary:   { background: 'var(--red)', color: '#fff' },
  secondary: { background: 'var(--bg-raised)', color: 'var(--fg)', border: '1px solid var(--border)' },
  outline:   { background: 'transparent', color: 'var(--fg)', border: '2px solid var(--fg)' },
  ghost:     { background: 'transparent', color: 'var(--fg-muted)' },
  danger:    { background: 'var(--red)', color: '#fff' },
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-opacity focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-85',
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2.5 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        style={{ fontFamily: 'var(--font-inter)', ...VARIANT_STYLES[variant], ...style }}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
