import { removeProductsWithBrokenImages } from '@/lib/scripts/remove-broken-products'

/**
 * CLI script to cleanup products with broken images
 * Usage: npx ts-node scripts/cleanup-broken-images.ts
 */
async function main() {
  console.log('='.repeat(50))
  console.log('🧹 JERSEY WALA - PRODUCT IMAGE CLEANUP')
  console.log('='.repeat(50))
  console.log('')

  try {
    const startTime = Date.now()

    console.log('🔄 Starting cleanup process...\n')
    const result = await removeProductsWithBrokenImages()

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log('\n' + '='.repeat(50))
    console.log('📊 CLEANUP REPORT')
    console.log('='.repeat(50))
    console.log(`Total Products Scanned: ${result.totalProducts}`)
    console.log(`Products with Broken Images: ${result.productsWithBrokenImages}`)
    console.log(`Products Deactivated: ${result.productsDeactivated}`)
    console.log(`Time Taken: ${duration}s`)

    if (result.details.length > 0) {
      console.log('\n📋 Deactivated Products:')
      result.details.forEach((detail, index) => {
        console.log(`\n${index + 1}. ${detail.productName}`)
        console.log(`   Product ID: ${detail.productId}`)
        if (detail.brokenImages.length > 0) {
          console.log(`   Broken Images:`)
          detail.brokenImages.forEach((img) => {
            console.log(`     ❌ ${img}`)
          })
        } else {
          console.log(`   Reason: No images found`)
        }
      })
    }

    console.log('\n✅ Cleanup completed successfully!')
    console.log('='.repeat(50))
  } catch (error) {
    console.error('\n❌ Cleanup failed:')
    console.error(error)
    process.exit(1)
  }
}

main()
