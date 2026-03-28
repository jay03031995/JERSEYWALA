import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = await request.json()

  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json(
      { success: false, error: 'Invalid signature' },
      { status: 400 }
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
}
