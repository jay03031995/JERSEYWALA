'use client'

import { useId, useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowRight, LoaderCircle } from 'lucide-react'

export default function NewsletterForm() {
  const inputId = useId()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    await new Promise((resolve) => window.setTimeout(resolve, 350))
    toast.success('You are on the list.')
    setEmail('')
    setSubmitting(false)
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor={inputId}>Email address</label>
      <input
        id={inputId}
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        autoComplete="email"
      />
      <button type="submit" disabled={submitting}>
        {submitting ? <LoaderCircle className="animate-spin" aria-hidden="true" size={15} /> : 'Subscribe'}
        {!submitting && <ArrowRight aria-hidden="true" size={14} />}
      </button>
    </form>
  )
}
