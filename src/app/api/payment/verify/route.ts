import { NextRequest, NextResponse } from 'next/server'
import { getCashfreeOrder } from '@/lib/cashfree'
import { markCashfreeOrderPaid } from '@/lib/payments/reconcile'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Invalid payment order' }, { status: 400 })
    }

    const cashfreeOrder = await getCashfreeOrder(orderId)
    if (cashfreeOrder.order_status !== 'PAID') {
      return NextResponse.json({
        paid: false,
        status: cashfreeOrder.order_status,
      })
    }

    const result = await markCashfreeOrderPaid(cashfreeOrder.order_id)
    if (!result.found) {
      return NextResponse.json({ error: 'Store order not found' }, { status: 404 })
    }

    return NextResponse.json({ paid: true, status: 'PAID' })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not verify payment'
    console.error('payment/verify error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
