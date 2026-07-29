import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook is not configured' }, { status: 503 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const stripe = new Stripe(secretKey)
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const orderId = session.metadata?.store_order_id ?? session.client_reference_id
  if (!orderId) return NextResponse.json({ received: true })
  const admin = createAdminClient()
  const { data: order } = await admin
    .from('orders')
    .select('id, payment_status')
    .eq('id', orderId)
    .maybeSingle()

  if (!order) return NextResponse.json({ received: true })

  if (event.type === 'checkout.session.completed' && session.payment_status === 'paid') {
    const { error: reserveError } = await admin.rpc('reserve_order_inventory', {
      target_order_id: order.id,
    })
    if (reserveError) {
      console.error('webhook inventory reservation failed:', reserveError.message)
      return NextResponse.json({ received: false }, { status: 409 })
    }
    await admin
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        payment_reference: typeof session.payment_intent === 'string' ? session.payment_intent : session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === 'string' ? session.payment_intent : null,
      })
      .eq('id', order.id)
      .neq('payment_status', 'paid')
  } else if (event.type === 'checkout.session.expired' && order.payment_status !== 'paid') {
    await admin
      .from('orders')
      .update({ payment_status: 'failed' })
      .eq('id', order.id)
  }

  return NextResponse.json({ received: true })
}
