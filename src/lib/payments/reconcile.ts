import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

export async function markCashfreeOrderPaid(
  cashfreeOrderId: string,
  paymentReference?: string,
) {
  const admin = createAdminClient()
  const { data: order, error: orderError } = await admin
    .from('orders')
    .select('id, payment_status, notes')
    .eq('payment_reference', cashfreeOrderId)
    .maybeSingle()

  if (orderError) throw orderError
  if (!order) return { found: false, paid: false }
  if (order.payment_status === 'paid') return { found: true, paid: true }

  const { error: reserveError } = await admin.rpc('reserve_order_inventory', {
    target_order_id: order.id,
  })
  if (reserveError) throw reserveError

  const { error: updateError } = await admin
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'confirmed',
      notes: paymentReference
        ? [order.notes, `Cashfree payment ID: ${paymentReference}`]
            .filter(Boolean)
            .join('\n')
        : order.notes,
    })
    .eq('id', order.id)
    .neq('payment_status', 'paid')

  if (updateError) throw updateError
  return { found: true, paid: true }
}

export async function markCashfreeOrderFailed(cashfreeOrderId: string) {
  const admin = createAdminClient()
  const { error } = await admin
    .from('orders')
    .update({ payment_status: 'failed' })
    .eq('payment_reference', cashfreeOrderId)
    .neq('payment_status', 'paid')

  if (error) throw error
}
