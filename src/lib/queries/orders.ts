import { createClient } from '@/lib/supabase/server'

export async function getUserOrders(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getOrderById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*), history:order_status_history(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getOrderByNumber(orderNumber: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*), history:order_status_history(*)')
    .eq('order_number', orderNumber)
    .single()
  if (error) throw error
  return data
}
