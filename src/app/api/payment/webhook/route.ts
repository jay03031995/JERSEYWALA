import { NextRequest, NextResponse } from 'next/server'
import { verifyCashfreeWebhook } from '@/lib/cashfree'
import {
  markCashfreeOrderFailed,
  markCashfreeOrderPaid,
} from '@/lib/payments/reconcile'

interface CashfreeWebhookPayload {
  type?: string
  data?: {
    order?: { order_id?: string }
    payment?: {
      cf_payment_id?: string | number
      payment_status?: string
    }
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-webhook-signature')
  const timestamp = request.headers.get('x-webhook-timestamp')

  if (!signature || !timestamp) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    if (!verifyCashfreeWebhook(rawBody, timestamp, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody) as CashfreeWebhookPayload
    const cashfreeOrderId = event.data?.order?.order_id
    if (!cashfreeOrderId) return NextResponse.json({ received: true })

    const paymentStatus = event.data?.payment?.payment_status
    const paymentReference = event.data?.payment?.cf_payment_id?.toString()

    if (
      event.type === 'PAYMENT_SUCCESS_WEBHOOK' &&
      paymentStatus === 'SUCCESS'
    ) {
      await markCashfreeOrderPaid(cashfreeOrderId, paymentReference)
    } else if (
      event.type === 'PAYMENT_FAILED_WEBHOOK' ||
      event.type === 'PAYMENT_USER_DROPPED_WEBHOOK'
    ) {
      await markCashfreeOrderFailed(cashfreeOrderId)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Cashfree webhook error:', error)
    return NextResponse.json({ received: false }, { status: 400 })
  }
}
