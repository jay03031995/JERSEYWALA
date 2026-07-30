import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateOrderNumber } from '@/lib/utils'

type CheckoutItem = {
  productId: string
  variantId: string
  quantity: number
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const admin = createAdminClient()

    const body = await request.json()
    const { items, address } = body as {
      items?: CheckoutItem[]
      address?: Record<string, string>
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json({ error: 'Your cart is empty or invalid' }, { status: 400 })
    }
    const requiredAddress = ['full_name', 'phone', 'address_line1', 'city', 'state', 'postal_code']
    if (!address || requiredAddress.some((field) => !address[field]?.trim())) {
      return NextResponse.json({ error: 'Please complete the delivery address' }, { status: 400 })
    }
    if (!/^\d{6}$/.test(address.postal_code) || !/^[+\d][\d\s-]{7,14}$/.test(address.phone)) {
      return NextResponse.json({ error: 'Enter a valid Indian phone number and PIN code' }, { status: 400 })
    }
    const variantIds = [...new Set(items.map((item) => item.variantId))]
    const { data: variants, error: variantError } = await admin
      .from('product_variants')
      .select('id, product_id, size, stock_quantity, additional_price, product:products(id, name, player_name, player_number, base_price, is_active, images:product_images(url, is_primary))')
      .in('id', variantIds)

    if (variantError) throw variantError
    const byId = new Map((variants ?? []).map((variant) => [variant.id, variant]))

    const verifiedItems = items.map((item) => {
      const variant = byId.get(item.variantId)
      const productValue = variant?.product
      const product = Array.isArray(productValue) ? productValue[0] : productValue
      const quantity = Number(item.quantity)
      if (
        !variant || !product || product.id !== item.productId || !product.is_active ||
        !Number.isInteger(quantity) || quantity < 1 || quantity > 10 ||
        variant.stock_quantity < quantity
      ) {
        throw new Error('One or more cart items are unavailable. Please refresh your cart.')
      }
      const unitPrice = Number(product.base_price) + Number(variant.additional_price ?? 0)
      const images = Array.isArray(product.images) ? product.images : []
      const primaryImage = images.find((image) => image.is_primary)?.url ?? images[0]?.url ?? null
      return {
        product_id: product.id,
        variant_id: variant.id,
        product_name: product.name,
        player_name: product.player_number
          ? `${product.player_name ?? ''} #${product.player_number}`.trim()
          : product.player_name,
        size: variant.size,
        quantity,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
        image_url: primaryImage,
      }
    })

    const subtotal = verifiedItems.reduce((sum, item) => sum + item.total_price, 0)
    const shipping = subtotal >= 999 ? 0 : 99
    const total = subtotal + shipping
    const orderNumber = generateOrderNumber()

    const { data: order, error } = await admin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user?.id ?? null,
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'online',
        subtotal,
        shipping_cost: shipping,
        discount_amount: 0,
        total,
        currency: 'INR',
        shipping_address: { ...address, country: 'IN' },
      })
      .select('id, order_number, total')
      .single()

    if (error) throw error

    const { error: itemsError } = await admin
      .from('order_items')
      .insert(verifiedItems.map((item) => ({ ...item, order_id: order.id })))
    if (itemsError) {
      await admin.from('orders').delete().eq('id', order.id)
      throw itemsError
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      amount: Number(order.total),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create order'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
