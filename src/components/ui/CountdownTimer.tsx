'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  targetDate: Date
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const tick = () => {
      const diff = targetDate.getTime() - Date.now()
      if (diff <= 0) return
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ]

  return (
    <div className="flex gap-3">
      {units.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center rounded-lg px-3 py-2 min-w-[56px]"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
        >
          <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--fg)', fontFamily: 'var(--font-oswald)' }}>
            {String(value).padStart(2, '0')}
          </span>
          <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{label}</span>
        </div>
      ))}
    </div>
  )
}
