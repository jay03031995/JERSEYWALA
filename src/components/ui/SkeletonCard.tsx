export default function SkeletonCard() {
  return (
    <div
      className="animate-pulse rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="aspect-square" style={{ background: 'var(--bg-raised)' }} />
      <div className="p-4 space-y-2.5">
        <div className="h-2.5 rounded-full w-1/3" style={{ background: 'var(--bg-raised)' }} />
        <div className="h-4 rounded w-2/3" style={{ background: 'var(--bg-raised)' }} />
        <div className="h-3.5 rounded w-1/2" style={{ background: 'var(--bg-raised)' }} />
        <div className="flex gap-1 pt-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 w-9 rounded-lg" style={{ background: 'var(--bg-raised)' }} />
          ))}
        </div>
        <div className="h-9 rounded-xl mt-1" style={{ background: 'var(--bg-raised)' }} />
      </div>
    </div>
  )
}
