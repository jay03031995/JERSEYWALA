import StoreContentEditor from '@/components/admin/StoreContentEditor'

export default function ContentPage() {
  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] font-black" style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}>
          Store Content
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}>
          Edit announcement ticker, header links, footer text, and store info
        </p>
      </div>
      <StoreContentEditor />
    </div>
  )
}
