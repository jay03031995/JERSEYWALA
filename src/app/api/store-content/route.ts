import { NextResponse } from 'next/server'
import { getStoreContent } from '@/lib/store-content'

export const dynamic = 'force-dynamic'

export async function GET() {
  const content = await getStoreContent()
  return NextResponse.json(content, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
