import { NextRequest, NextResponse } from 'next/server'
import {
  createCashfreeOrder,
  getCashfreeMode,
  getCashfreeOrder,
} from '@/lib/cashfree'
import { createAdminClient } from '@/lib/supabase/admin'

interface ShippingAddress {
  full_name?: string
  phone?: string
}

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Invalid store order' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: storeOrder, error: orderError } = await admin
      .from('orders')
      .select('id, order_number, total, currency, payment_status, payment_method, cashfree_order_id, shipping_address, guest_email')
      .eq('id', orderId)
      .single()

    if (orderError || !storeOrder || storeOrder.payment_method !== 'online') {
      return NextResponse.json({ error: 'Store order not found' }, { status: 404 })
    }
    if (storeOrder.payment_status === 'paid') {
      return NextResponse.json({ error: 'This order is already paid' }, { status: 409 })
    }

    if (storeOrder.cashfree_order_id) {
      const existing = await getCashfreeOrder(storeOrder.cashfree_order_id)
      if (existing.order_status === 'ACTIVE' && existing.payment_session_id) {
        return NextResponse.json({
          paymentSessionId: existing.payment_session_id,
          mode: getCashfreeMode(),
        })
      }
    }

    const shippingAddress =
      (storeOrder.shipping_address ?? {}) as ShippingAddress
    const customerPhone = (shippingAddress.phone ?? '').replace(/\D/g, '').slice(-10)
    if (customerPhone.length !== 10) {
      return NextResponse.json(
        { error: 'A valid 10-digit phone number is required for online payment' },
        { status: 400 },
      )
    }

    const cashfreeOrderId = `JW_${storeOrder.id.replaceAll('-', '')}`
    const origin = request.nextUrl.origin
    const cashfreeOrder = await createCashfreeOrder({
      orderId: cashfreeOrderId,
      amount: Number(storeOrder.total),
      currency: storeOrder.currency ?? 'INR',
      customer: {
        id: `customer_${storeOrder.id.replaceAll('-', '')}`,
        name: shippingAddress.full_name?.trim() || 'Jersey Wala Customer',
        phone: customerPhone,
        email: storeOrder.guest_email ?? undefined,
      },
      returnUrl: `${origin}/checkout/success?order_id=${cashfreeOrderId}`,
      notifyUrl: `${origin}/api/payment/webhook`,
      note: `The Jersey Wala order ${storeOrder.order_number}`,
      storeOrderId: storeOrder.id,
      orderNumber: storeOrder.order_number,
    })

    if (!cashfreeOrder.payment_session_id) {
      throw new Error('Cashfree did not return a payment session')
    }

    const { error: updateError } = await admin
      .from('orders')
      .update({
        cashfree_order_id: cashfreeOrder.order_id,
        cashfree_cf_order_id: cashfreeOrder.cf_order_id,
        payment_reference: cashfreeOrder.order_id,
      })
      .eq('id', storeOrder.id)
    if (updateError) throw updateError

    return NextResponse.json({
      paymentSessionId: cashfreeOrder.payment_session_id,
      mode: getCashfreeMode(),
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Payment gateway error'
    console.error('payment/create error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
