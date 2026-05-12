import ImportFromSite from '@/components/admin/ImportFromSite'

export const dynamic = 'force-dynamic'

export default function ImportSitePage() {
  return (
    <div className="px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1
          className="text-[28px] font-black"
          style={{ fontFamily: 'var(--font-oswald)', color: 'var(--fg)' }}
        >
          Import full site
        </h1>
        <p
          className="text-[13px] mt-1"
          style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-inter)' }}
        >
          Bulk-import every product from any Shopify store — paste the homepage URL or a single
          collection URL, scan, preview, and import in batches.
        </p>
      </div>
      <ImportFromSite />
    </div>
  )
}
