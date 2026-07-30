import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

const CASHFREE_API_VERSION = '2025-01-01'

export type CashfreeMode = 'sandbox' | 'production'

export interface CashfreeOrder {
  cf_order_id: string
  order_id: string
  order_status: 'ACTIVE' | 'PAID' | 'EXPIRED' | 'TERMINATED'
  payment_session_id?: string
}

interface CreateCashfreeOrderInput {
  orderId: string
  amount: number
  currency: string
  customer: {
    id: string
    name: string
    phone: string
    email?: string
  }
  returnUrl: string
  notifyUrl: string
  note: string
  storeOrderId: string
  orderNumber: string
}

function getConfig() {
  const clientId = process.env.CASHFREE_CLIENT_ID
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('Cashfree is not configured. Contact support.')
  }

  const mode: CashfreeMode =
    process.env.CASHFREE_ENV?.toLowerCase() === 'production'
      ? 'production'
      : 'sandbox'

  return {
    clientId,
    clientSecret,
    mode,
    baseUrl:
      mode === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg',
  }
}

async function cashfreeRequest<T>(
  path: string,
  init: RequestInit = {},
  idempotencyKey?: string,
): Promise<T> {
  const config = getConfig()
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': CASHFREE_API_VERSION,
      'x-client-id': config.clientId,
      'x-client-secret': config.clientSecret,
      ...(idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : {}),
      ...init.headers,
    },
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message =
      body?.message || body?.type || `Cashfree request failed (${response.status})`
    throw new Error(message)
  }

  return body as T
}

export function getCashfreeMode(): CashfreeMode {
  return getConfig().mode
}

export function createCashfreeOrder(input: CreateCashfreeOrderInput) {
  return cashfreeRequest<CashfreeOrder>(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify({
        order_id: input.orderId,
        order_amount: Number(input.amount.toFixed(2)),
        order_currency: input.currency.toUpperCase(),
        customer_details: {
          customer_id: input.customer.id,
          customer_name: input.customer.name,
          customer_phone: input.customer.phone,
          ...(input.customer.email
            ? { customer_email: input.customer.email }
            : {}),
        },
        order_meta: {
          return_url: input.returnUrl,
          notify_url: input.notifyUrl,
        },
        order_note: input.note,
        order_tags: {
          store_order_id: input.storeOrderId,
          order_number: input.orderNumber,
        },
      }),
    },
    input.storeOrderId,
  )
}

export function getCashfreeOrder(orderId: string) {
  return cashfreeRequest<CashfreeOrder>(
    `/orders/${encodeURIComponent(orderId)}`,
  )
}

export function verifyCashfreeWebhook(
  rawBody: string,
  timestamp: string,
  signature: string,
) {
  const { clientSecret } = getConfig()
  const expected = createHmac('sha256', clientSecret)
    .update(`${timestamp}${rawBody}`)
    .digest('base64')

  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)
  return (
    expectedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(expectedBuffer, signatureBuffer)
  )
}
