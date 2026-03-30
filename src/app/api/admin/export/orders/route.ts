import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const admin = createAdminClient()
  const { data: orders } = await admin
    .from('orders')
    .select('*, items:order_items(product_name, size, quantity, unit_price, total_price)')
    .order('created_at', { ascending: false })

  if (!orders) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })

  const headers = [
    'order_number', 'date', 'status', 'payment_status',
    'customer_name', 'phone', 'address', 'city', 'state', 'pin',
    'subtotal', 'shipping', 'discount', 'total',
    'items',
  ]

  const rows = orders.map((o) => {
    const addr = o.shipping_address as {
      full_name?: string; phone?: string
      address_line1?: string; address_line2?: string
      city?: string; state?: string; postal_code?: string
    }
    const items = (o.items as { product_name: string; size: string; quantity: number; unit_price: number }[] ?? [])
      .map((i) => `${i.product_name} (${i.size}) x${i.quantity} @₹${i.unit_price}`)
      .join(' | ')

    return [
      o.order_number,
      new Date(o.created_at).toLocaleDateString('en-IN'),
      o.status, o.payment_status,
      addr?.full_name ?? '', addr?.phone ?? '',
      [addr?.address_line1, addr?.address_line2].filter(Boolean).join(', '),
      addr?.city ?? '', addr?.state ?? '', addr?.postal_code ?? '',
      o.subtotal, o.shipping_cost, o.discount_amount, o.total,
      items,
    ].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
  })

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
