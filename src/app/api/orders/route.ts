import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(request: NextRequest) {
  // Read user from session (may be null for guest)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Use service-role client to bypass RLS for order creation
  const admin = createAdminClient()

  const body = await request.json()
  const { items, address, subtotal, shipping, total } = body

  const orderNumber = generateOrderNumber()

  const { data: order, error } = await admin
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: user?.id ?? null,
      status: 'pending',
      payment_status: 'pending',
      subtotal,
      shipping_cost: shipping,
      discount_amount: 0,
      total,
      currency: 'INR',
      shipping_address: address,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Insert order items
  const orderItems = items.map((item: {
    productId: string
    variantId: string
    name: string
    playerName?: string
    size: string
    quantity: number
    price: number
    imageUrl: string
  }) => ({
    order_id: order.id,
    product_id: item.productId,
    variant_id: item.variantId,
    product_name: item.name,
    player_name: item.playerName,
    size: item.size,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
    image_url: item.imageUrl,
  }))

  await admin.from('order_items').insert(orderItems)

  return NextResponse.json({ orderId: order.id, orderNumber })
}
