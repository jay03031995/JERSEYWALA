import { createAdminClient } from '@/lib/supabase/admin'

export type StoreContent = {
  ticker_messages: string[]
  store_name: string
  support_email: string
  support_phone: string
  free_shipping_threshold: string
  flat_shipping_fee: string
  return_policy_days: string
  footer_tagline: string
  footer_address: string
  instagram_url: string
  twitter_url: string
  facebook_url: string
  whatsapp_number: string
  nav_sports: string
  nav_leagues: string
  discount_code_hint: string
}

export const STORE_CONTENT_DEFAULTS: StoreContent = {
  ticker_messages: [
    'Free delivery on orders above ₹999',
    'Use code JERSEY10 for 10% off',
    'FIFA 2026 jerseys now available',
  ],
  store_name: 'The Jersey Wala',
  support_email: 'hello@thejerseywala.in',
  support_phone: '',
  free_shipping_threshold: '999',
  flat_shipping_fee: '99',
  return_policy_days: '7',
  footer_tagline: "India's home for official and replica sports jerseys.",
  footer_address: 'Gurugram, Haryana, India',
  instagram_url: '',
  twitter_url: '',
  facebook_url: '',
  whatsapp_number: '',
  nav_sports: 'Football, Cricket, IPL 2026',
  nav_leagues: 'Premier League, La Liga, IPL 2026, International Cricket',
  discount_code_hint: 'JERSEY10',
}

export function withDefaults(partial: Partial<StoreContent> | null | undefined): StoreContent {
  return { ...STORE_CONTENT_DEFAULTS, ...(partial ?? {}) }
}

export async function getStoreContent(): Promise<StoreContent> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('store_settings')
      .select('data')
      .eq('id', 1)
      .single()
    return withDefaults(data?.data as Partial<StoreContent>)
  } catch {
    return STORE_CONTENT_DEFAULTS
  }
}
