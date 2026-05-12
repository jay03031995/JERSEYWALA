import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      return NextResponse.json(
        { success: false, error: 'Payment gateway is not configured' },
        { status: 500 },
      )
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment fields' },
        { status: 400 },
      )
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 },
      )
    }

    if (orderId) {
      const admin = createAdminClient()
      await admin
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          payment_reference: razorpay_payment_id,
        })
        .eq('id', orderId)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Payment verification error'
    console.error('payment/verify error:', err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
