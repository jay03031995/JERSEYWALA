import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const orderNumber = req.nextUrl.searchParams.get('order')
  if (!orderNumber) return NextResponse.json({ error: 'Order number required' }, { status: 400 })

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('orders')
    .select('order_number, status, tracking_number, tracking_url, shipped_at, delivered_at, created_at')
    .eq('order_number', orderNumber.toUpperCase())
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  return NextResponse.json({
    order_number: order.order_number,
    status: order.status,
    tracking_number: order.tracking_number,
    tracking_url: order.tracking_url,
    shipped_at: order.shipped_at,
    delivered_at: order.delivered_at,
    created_at: order.created_at,
  })
}
