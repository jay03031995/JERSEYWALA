'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { MapPin, RefreshCw, ExternalLink } from 'lucide-react'
import type { OrderStatus } from '@/types/database'
import PrintInvoice from './PrintInvoice'

interface TrackingEvent {
  datetime: string
  status: string
  location: string
  description: string
}

interface TrackingResult {
  awb: string
  status: string
  location?: string
  expectedDelivery?: string
  events: TrackingEvent[]
  mock?: boolean
  error?: string
}

export default function OrderActions({
  orderId, currentStatus, currentTracking, allStatuses, order,
}: {
  orderId: string
  currentStatus: OrderStatus
  currentTracking: string
  allStatuses: OrderStatus[]
  order: {
    id: string
    order_number: string
    created_at: string
    status: string
    payment_status: string
    payment_reference?: string
    subtotal: number
    shipping_cost: number
    discount_amount: number
    total: number
    shipping_address: {
      full_name?: string; phone?: string
      address_line1?: string; address_line2?: string
      city?: string; state?: string; postal_code?: string
    }
    items: {
      id: string; product_name: string; player_name?: string
      size: string; quantity: number; unit_price: number; total_price: number
    }[]
  }
}) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [tracking, setTracking] = useState(currentTracking)
  const [saving, setSaving] = useState(false)
  const [trackingData, setTrackingData] = useState<TrackingResult | null>(null)
  const [trackingLoading, setTrackingLoading] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, tracking_number: tracking }),
    })
    setSaving(false)
    if (res.ok) {
      toast.success('Order updated')
      router.refresh()
    } else {
      toast.error('Failed to update order')
    }
  }

  const fetchTracking = async () => {
    if (!tracking.trim()) {
      toast.error('Enter a tracking number first')
      return
    }
    setTrackingLoading(true)
    try {
      const res = await fetch(`/api/admin/delhivery?awb=${encodeURIComponent(tracking.trim())}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setTrackingData(data)
    } catch (err) {
      toast.error(String(err) || 'Failed to fetch tracking')
    } finally {
      setTrackingLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Update Order Card */}
      <div
        className="rounded-2xl p-5 h-fit space-y-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <p
          className="text-[12px] font-semibold uppercase tracking-[0.06em]"
          style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
        >
          Update Order
        </p>

        {/* Status */}
        <div>
          <label
            className="block text-[11px] font-medium uppercase tracking-[0.04em] mb-1.5"
            style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
          >
            Order Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
            style={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              color: 'var(--fg)',
              fontFamily: 'var(--font-inter)',
            }}
          >
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {/* Tracking */}
        <div>
          <label
            className="block text-[11px] font-medium uppercase tracking-[0.04em] mb-1.5"
            style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
          >
            Delhivery AWB / Tracking No.
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="e.g. 1234567890123"
              className="flex-1 px-3 py-2 rounded-xl text-[13px] outline-none"
              style={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                color: 'var(--fg)',
                fontFamily: 'var(--font-inter)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--fg-sub)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
            <button
              onClick={fetchTracking}
              disabled={trackingLoading || !tracking.trim()}
              title="Track on Delhivery"
              className="px-3 rounded-xl flex items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
            >
              <RefreshCw size={13} className={trackingLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 rounded-xl text-[13px] font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-inter)' }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>

        <PrintInvoice order={order} />
      </div>

      {/* Delhivery Tracking Card */}
      {trackingData && (
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <p
              className="text-[12px] font-semibold uppercase tracking-[0.06em]"
              style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}
            >
              Live Tracking
              {trackingData.mock && (
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,197,24,0.15)', color: 'var(--gold)' }}>
                  Demo
                </span>
              )}
            </p>
            <a
              href={`https://www.delhivery.com/track/package/${trackingData.awb}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px]"
              style={{ color: 'var(--blue)', fontFamily: 'var(--font-inter)' }}
            >
              Delhivery <ExternalLink size={10} />
            </a>
          </div>

          {/* Current status banner */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
            style={{ background: 'rgba(57,255,20,0.07)', border: '1px solid rgba(57,255,20,0.15)' }}
          >
            <MapPin size={13} style={{ color: 'var(--green)', flexShrink: 0 }} />
            <div>
              <p className="text-[12px] font-bold" style={{ color: 'var(--green)', fontFamily: 'var(--font-inter)' }}>
                {trackingData.status}
              </p>
              {trackingData.location && (
                <p className="text-[11px]" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                  {trackingData.location}
                </p>
              )}
              {trackingData.expectedDelivery && (
                <p className="text-[11px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                  ETA: {new Date(trackingData.expectedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              )}
            </div>
          </div>

          {/* Events timeline */}
          <div className="space-y-0">
            {trackingData.events.map((ev, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className="w-2 h-2 rounded-full shrink-0 mt-1"
                    style={{ background: i === 0 ? 'var(--green)' : 'var(--border)' }}
                  />
                  {i < trackingData.events.length - 1 && (
                    <div className="w-px flex-1 mt-1" style={{ background: 'var(--border)', minHeight: '20px' }} />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-[12px] font-medium" style={{ color: i === 0 ? 'var(--fg)' : 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
                    {ev.status}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                    {ev.location} · {new Date(ev.datetime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {ev.description && ev.description !== ev.status && (
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg-sub)', fontFamily: 'var(--font-inter)' }}>
                      {ev.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
