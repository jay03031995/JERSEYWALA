export type JerseyEdition = 'official' | 'fan_edition' | 'replica'
export type JerseyType = 'home' | 'away' | 'third' | 'training' | 'goalkeeper' | 'limited'
export type SportType = 'football' | 'cricket' | 'ipl'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type UserRole = 'customer' | 'admin' | 'super_admin'

export interface Profile {
  id: string
  email: string
  full_name?: string
  phone?: string
  avatar_url?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Sport {
  id: string
  name: string
  slug: string
  type: SportType
  icon_url?: string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface League {
  id: string
  sport_id: string
  name: string
  slug: string
  logo_url?: string
  country?: string
  display_order: number
  is_active: boolean
  created_at: string
  sport?: Sport
}

export interface Team {
  id: string
  league_id: string
  name: string
  short_name?: string
  slug: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  founded_year?: number
  country?: string
  is_active: boolean
  created_at: string
  league?: League
}

export interface Product {
  id: string
  team_id?: string
  name: string
  slug: string
  description?: string
  player_name?: string
  player_number?: string
  season?: string
  jersey_type: JerseyType
  edition: JerseyEdition
  base_price: number
  compare_price?: number
  cost_price?: number
  is_active: boolean
  is_featured: boolean
  is_new_arrival: boolean
  meta_title?: string
  meta_description?: string
  tags?: string[]
  created_at: string
  updated_at: string
  team?: Team
  images?: ProductImage[]
  variants?: ProductVariant[]
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text?: string
  position: number
  is_primary: boolean
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL'
  stock_quantity: number
  sku?: string
  additional_price: number
  created_at: string
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  country: string
  postal_code: string
  is_default: boolean
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id?: string
  guest_email?: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method?: string
  payment_reference?: string
  subtotal: number
  shipping_cost: number
  discount_amount: number
  total: number
  currency: string
  shipping_address: Address
  billing_address?: Address
  notes?: string
  tracking_number?: string
  tracking_url?: string
  shipped_at?: string
  delivered_at?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  variant_id?: string
  product_name: string
  player_name?: string
  size: string
  quantity: number
  unit_price: number
  total_price: number
  image_url?: string
  created_at: string
}

export interface DiscountCode {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  minimum_order: number
  max_uses?: number
  used_count: number
  is_active: boolean
  expires_at?: string
  created_at: string
}

export interface Review {
  id: string
  product_id: string
  user_id?: string
  order_item_id?: string
  rating: number
  title?: string
  body?: string
  is_verified: boolean
  is_approved: boolean
  created_at: string
  profile?: Profile
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  image_url: string
  cta_text?: string
  cta_link?: string
  position: string
  display_order: number
  is_active: boolean
  starts_at?: string
  ends_at?: string
  created_at: string
}
