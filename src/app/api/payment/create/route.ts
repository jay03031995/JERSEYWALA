import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json(
        { error: 'Payment gateway is not configured. Contact support.' },
        { status: 500 },
      )
    }

    const { orderId } = await request.json()
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Invalid store order' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: storeOrder, error: orderError } = await admin
      .from('orders')
      .select('id, order_number, total, shipping_cost, currency, payment_status, payment_method, stripe_checkout_session_id, items:order_items(product_name, quantity, unit_price)')
      .eq('id', orderId)
      .single()
    if (orderError || !storeOrder || storeOrder.payment_method !== 'online') {
      return NextResponse.json({ error: 'Store order not found' }, { status: 404 })
    }
    if (storeOrder.payment_status === 'paid') {
      return NextResponse.json({ error: 'This order is already paid' }, { status: 409 })
    }

    const stripe = new Stripe(secretKey)
    if (storeOrder.stripe_checkout_session_id) {
      const existing = await stripe.checkout.sessions.retrieve(storeOrder.stripe_checkout_session_id)
      if (existing.status === 'open' && existing.url) {
        return NextResponse.json({ checkoutUrl: existing.url })
      }
    }

    const currency = (storeOrder.currency ?? 'INR').toLowerCase()
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = (storeOrder.items ?? []).map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency,
        unit_amount: Math.round(Number(item.unit_price) * 100),
        product_data: { name: item.product_name },
      },
    }))
    if (Number(storeOrder.shipping_cost) > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency,
          unit_amount: Math.round(Number(storeOrder.shipping_cost) * 100),
          product_data: { name: 'Shipping' },
        },
      })
    }

    const origin = request.nextUrl.origin
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      client_reference_id: storeOrder.id,
      metadata: {
        store_order_id: storeOrder.id,
        order_number: storeOrder.order_number,
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?payment=cancelled`,
      billing_address_collection: 'auto',
      phone_number_collection: { enabled: true },
      payment_method_types: ['card'],
    })

    await admin
      .from('orders')
      .update({
        stripe_checkout_session_id: session.id,
        payment_reference: session.id,
      })
      .eq('id', storeOrder.id)

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Payment gateway error'
    console.error('payment/create error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
