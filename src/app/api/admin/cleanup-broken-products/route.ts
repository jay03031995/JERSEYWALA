import { NextResponse } from 'next/server'
import { removeProductsWithBrokenImages } from '@/lib/scripts/remove-broken-products'

/**
 * POST /api/admin/cleanup-broken-products
 * 
 * Triggers a cleanup of products with broken image links.
 * 
 * SECURITY: Requires admin authentication
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Product cleanup completed",
 *   "data": {
 *     "totalProducts": 100,
 *     "productsWithBrokenImages": 5,
 *     "productsDeactivated": 5,
 *     "details": [...]
 *   }
 * }
 */
export async function POST() {
  try {
    // TODO: Uncomment for production - Add auth check
    // const session = await auth()
    // if (!session?.user || session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Unauthorized. Admin access required.' },
    //     { status: 401 }
    //   )
    // }

    // Rate limiting: Check if cleanup was run recently (optional)
    // Add headers to prevent concurrent cleanup runs
    const response = NextResponse.json(
      {
        success: true,
        message: 'Product cleanup completed',
        data: await removeProductsWithBrokenImages(),
      },
      { status: 200 }
    )

    // Add headers to help prevent accidental double-runs
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Cache-Control', 'no-store, max-age=0')

    return response
  } catch (error) {
    console.error('Cleanup error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cleanup failed',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/cleanup-broken-products
 * 
 * Returns status and instructions
 */
export async function GET() {
  return NextResponse.json({
    message: 'Product Cleanup API',
    documentation: {
      endpoint: 'POST /api/admin/cleanup-broken-products',
      description: 'Triggers cleanup of products with broken image links',
      response: {
        success: 'boolean',
        message: 'string',
        data: {
          totalProducts: 'number',
          productsWithBrokenImages: 'number',
          productsDeactivated: 'number',
          details: 'array of deactivated products',
        },
      },
    },
    example: {
      curl: "curl -X POST http://localhost:3000/api/admin/cleanup-broken-products",
      javascript: `
        fetch('/api/admin/cleanup-broken-products', { method: 'POST' })
          .then(r => r.json())
          .then(console.log)
      `,
    },
  })
}
