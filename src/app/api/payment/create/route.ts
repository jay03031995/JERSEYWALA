import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  const { amount, currency = 'INR', orderId } = await request.json()

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency,
    receipt: orderId ?? `receipt_${Date.now()}`,
  })

  return NextResponse.json({ razorpayOrderId: order.id })
}
