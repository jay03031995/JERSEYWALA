import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase env vars are not configured')
  }
  return createClient(url, key)
}

interface Product {
  id: string
  name: string
  images: { id: string; url: string }[]
}

interface ValidationResult {
  url: string
  status: number | null
  isValid: boolean
  error?: string
}

/**
 * Validate if an image URL is accessible
 */
async function validateImageUrl(url: string, timeout = 5000): Promise<ValidationResult> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    }).catch(() =>
      // Fallback to GET if HEAD fails
      fetch(url, {
        method: 'GET',
        signal: controller.signal,
      })
    )

    clearTimeout(timeoutId)

    const isValid = response.status >= 200 && response.status < 400
    return {
      url,
      status: response.status,
      isValid,
    }
  } catch (error) {
    return {
      url,
      status: null,
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get all active products with their images
 */
async function getProductsWithImages(): Promise<Product[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      images:product_images(id, url)
    `
    )
    .eq('is_active', true)

  if (error) throw error
  return data || []
}

/**
 * Mark products with broken images as inactive
 */
async function deactivateProductsWithBrokenImages(productIds: string[]): Promise<void> {
  if (productIds.length === 0) return

  const supabase = getSupabase()
  const { error } = await supabase
    .from('products')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .in('id', productIds)

  if (error) throw error
}

/**
 * Log broken image records
 */
async function logBrokenImages(
  productId: string,
  imageId: string,
  imageUrl: string,
  errorMessage: string
): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.from('broken_product_images').insert({
    product_id: productId,
    image_id: imageId,
    image_url: imageUrl,
    error_message: errorMessage,
  })

  if (error) {
    console.error(`Failed to log broken image ${imageId}:`, error)
  }
}

/**
 * Main function to remove products with broken images
 */
export async function removeProductsWithBrokenImages(): Promise<{
  totalProducts: number
  productsWithBrokenImages: number
  productsDeactivated: number
  details: {
    productId: string
    productName: string
    brokenImages: string[]
  }[]
}> {
  console.log('🔍 Fetching products with images...')
  const products = await getProductsWithImages()
  console.log(`📦 Found ${products.length} active products`)

  const productsToDeactivate: string[] = []
  const details: {
    productId: string
    productName: string
    brokenImages: string[]
  }[] = []

  for (const product of products) {
    if (!product.images || product.images.length === 0) {
      console.log(`⚠️  ${product.name} - No images found`)
      productsToDeactivate.push(product.id)
      details.push({
        productId: product.id,
        productName: product.name,
        brokenImages: [],
      })
      continue
    }

    const brokenImages: string[] = []

    for (const image of product.images) {
      console.log(`🔗 Validating: ${image.url}`)
      const result = await validateImageUrl(image.url)

      if (!result.isValid) {
        console.log(
          `❌ Broken: ${image.url} (Status: ${result.status || 'N/A'}, Error: ${result.error})`
        )
        brokenImages.push(image.url)
        await logBrokenImages(
          product.id,
          image.id,
          image.url,
          result.error || `HTTP ${result.status}`
        )
      } else {
        console.log(`✅ Valid: ${image.url}`)
      }
    }

    // If all images are broken, mark product for deactivation
    if (brokenImages.length === product.images.length) {
      console.log(`🗑️  Deactivating ${product.name} - all images broken`)
      productsToDeactivate.push(product.id)
      details.push({
        productId: product.id,
        productName: product.name,
        brokenImages,
      })
    }
  }

  // Deactivate products with all broken images
  if (productsToDeactivate.length > 0) {
    console.log(`\n🗑️  Deactivating ${productsToDeactivate.length} products with broken images...`)
    await deactivateProductsWithBrokenImages(productsToDeactivate)
    console.log(`✅ Successfully deactivated ${productsToDeactivate.length} products`)
  }

  return {
    totalProducts: products.length,
    productsWithBrokenImages: productsToDeactivate.length,
    productsDeactivated: productsToDeactivate.length,
    details,
  }
}
