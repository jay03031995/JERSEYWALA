import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(request: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Payment gateway is not configured. Contact support.' },
        { status: 500 },
      )
    }

    const { amount, currency = 'INR', orderId } = await request.json()
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: orderId ?? `receipt_${Date.now()}`,
    })

    return NextResponse.json({ razorpayOrderId: order.id })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Payment gateway error'
    console.error('payment/create error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
