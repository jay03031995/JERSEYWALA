import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const awb = req.nextUrl.searchParams.get('awb')
  if (!awb) return NextResponse.json({ error: 'AWB required' }, { status: 400 })

  const token = process.env.DELHIVERY_API_TOKEN
  if (!token) {
    // Return mock data if no token configured
    return NextResponse.json({
      mock: true,
      awb,
      status: 'In Transit',
      location: 'Mumbai Hub',
      events: [
        { datetime: new Date().toISOString(), status: 'In Transit', location: 'Mumbai Hub', description: 'Package in transit' },
        { datetime: new Date(Date.now() - 86400000).toISOString(), status: 'Picked Up', location: 'Delhi Warehouse', description: 'Package picked up by courier' },
        { datetime: new Date(Date.now() - 172800000).toISOString(), status: 'Manifested', location: 'Delhi', description: 'Shipment created' },
      ],
    })
  }

  try {
    const res = await fetch(
      `https://track.delhivery.com/api/v1/packages/json/?waybill=${awb}&token=${token}`,
      { headers: { 'Accept': 'application/json' }, next: { revalidate: 0 } }
    )
    const data = await res.json()
    const shipment = data?.ShipmentData?.[0]?.Shipment

    if (!shipment) return NextResponse.json({ error: 'AWB not found' }, { status: 404 })

    const events = (shipment.Scans ?? []).map((s: {
      ScanDetail: { ScanDateTime: string; Scan: string; ScannedLocation: string; Instructions: string }
    }) => ({
      datetime: s.ScanDetail.ScanDateTime,
      status: s.ScanDetail.Scan,
      location: s.ScanDetail.ScannedLocation,
      description: s.ScanDetail.Instructions,
    }))

    return NextResponse.json({
      awb,
      status: shipment.Status?.Status ?? 'Unknown',
      location: shipment.Status?.StatusLocation ?? '',
      expectedDelivery: shipment.ExpectedDeliveryDate ?? null,
      events,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tracking' }, { status: 500 })
  }
}
