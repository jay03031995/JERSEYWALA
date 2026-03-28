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
        <div key={label} className="flex flex-col items-center bg-white/10 rounded-lg px-3 py-2 min-w-[56px]">
          <span className="text-2xl font-bold tabular-nums">
            {String(value).padStart(2, '0')}
          </span>
          <span className="text-xs opacity-70">{label}</span>
        </div>
      ))}
    </div>
  )
}
