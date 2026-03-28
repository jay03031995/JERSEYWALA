import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, '0')
  return `SK-${date}-${rand}`
}

export function getDiscountPercent(base: number, compare: number) {
  if (!compare || compare <= base) return 0
  return Math.round(((compare - base) / compare) * 100)
}
