# Jersey Wala - Image Cleanup Tools

## Overview

This document explains the tools created to identify and remove products with broken image links from your Supabase database.

## What's Been Created

### 1. **Database Migration** (`supabase/migrations/20260512000000_remove_broken_images.sql`)

Creates database infrastructure for tracking broken images:
- `broken_product_images` table: Logs all broken image URLs found
- `identify_products_with_broken_images()`: SQL function to find products with no images
- `deactivate_products_with_no_images()`: SQL function to deactivate those products
- `image_validation_status` column: Tracks validation status per product

### 2. **Validation Script** (`src/lib/scripts/remove-broken-products.ts`)

Core TypeScript module that:
- ✅ Fetches all active products with their images from Supabase
- 🔗 Validates each image URL (checks if it returns HTTP 200-399)
- 📋 Logs broken images to the `broken_product_images` table
- 🗑️ Deactivates products where **all images are broken**
- 📊 Returns detailed validation report

**Key Features:**
- HEAD request validation (falls back to GET)
- 5-second timeout per URL
- Detailed error reporting
- Batch processing

### 3. **API Endpoint** (`src/app/api/admin/cleanup-broken-products/route.ts`)

HTTP endpoint to trigger cleanup from your admin dashboard:
```
POST /api/admin/cleanup-broken-products
```

Response:
```json
{
  "success": true,
  "message": "Product cleanup completed",
  "data": {
    "totalProducts": 100,
    "productsWithBrokenImages": 5,
    "productsDeactivated": 5,
    "details": [
      {
        "productId": "uuid",
        "productName": "Jersey Name",
        "brokenImages": ["url1", "url2"]
      }
    ]
  }
}
```

## How to Use

### Option 1: Run via API (Recommended for Production)

```bash
curl -X POST http://localhost:3000/api/admin/cleanup-broken-products \
  -H "Content-Type: application/json"
```

### Option 2: Run via CLI Script

```bash
# Install dependencies if needed
npm install ts-node

# Run the cleanup
npx ts-node scripts/cleanup-broken-images.ts
```

### Option 3: Run in Your Application

```typescript
import { removeProductsWithBrokenImages } from '@/lib/scripts/remove-broken-products'

const result = await removeProductsWithBrokenImages()
console.log(result)
```

## What Gets Removed

The system **deactivates** (not deletes) products when:
- ❌ A product has NO images in the database
- ❌ ALL images for a product return HTTP errors (404, 500, timeouts, etc.)

The system **does NOT** remove products when:
- ✅ At least one image is valid
- ✅ The product has a valid `is_active = true` state

## Database Tracking

All broken images are logged in `broken_product_images` table:

```sql
SELECT * FROM broken_product_images;
-- Shows: product_id, image_id, image_url, error_message, checked_at
```

This allows you to:
1. Review exactly which images are broken
2. Audit the cleanup process
3. Re-validate later

## Example Output

```
🔍 Fetching products with images...
📦 Found 150 active products

🔗 Validating: https://cdn.shopify.com/...
✅ Valid: https://cdn.shopify.com/...

🔗 Validating: https://broken-cdn.com/...
❌ Broken: https://broken-cdn.com/... (Status: 404, Error: Not Found)

🗑️  Deactivating Broken Jersey 01 - all images broken

📊 Cleanup Summary:
   Total Products: 150
   Products with Broken Images: 3
   Products Deactivated: 3

📋 Deactivated Products:
   - Broken Jersey 01 (ID: xxx)
     ❌ https://broken-cdn.com/image1.jpg
   - Broken Jersey 02 (ID: yyy)
     ❌ https://broken-cdn.com/image2.jpg

✅ Cleanup completed successfully!
```

## Setup Instructions

### 1. Apply the Migration

```bash
# Using Supabase CLI
supabase migration up

# Or manually in Supabase SQL editor, paste the migration file contents
```

### 2. Add Authentication to API Endpoint

Edit `src/app/api/admin/cleanup-broken-products/route.ts` and uncomment the auth check:

```typescript
const user = await getCurrentUser()
if (user?.role !== 'admin' && user?.role !== 'super_admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 3. (Optional) Add to Admin Dashboard

Create an admin button to trigger the cleanup:

```tsx
async function handleCleanup() {
  const response = await fetch('/api/admin/cleanup-broken-products', {
    method: 'POST',
  })
  const result = await response.json()
  console.log(result)
}
```

## Safety Features

✅ **Non-Destructive**: Deactivates products instead of deleting them
✅ **Auditable**: All broken images are logged in the database
✅ **Recoverable**: You can easily re-activate products if needed
✅ **Gradual**: Only targets products with 100% broken images
✅ **Timeout Protection**: 5-second timeout per URL check

## Reverting Changes

If you need to re-activate deactivated products:

```sql
-- Reactivate all products that were deactivated
UPDATE products
SET is_active = TRUE, updated_at = NOW()
WHERE id IN (
  SELECT product_id FROM broken_product_images
  GROUP BY product_id
);

-- Or reactivate specific products
UPDATE products
SET is_active = TRUE, updated_at = NOW()
WHERE id = 'product-uuid-here';
```

## Monitoring

Check the status of your cleanup:

```sql
-- See all broken images found
SELECT product_id, image_url, error_message, checked_at
FROM broken_product_images
ORDER BY checked_at DESC;

-- See deactivated products
SELECT id, name, is_active, image_validation_status, updated_at
FROM products
WHERE is_active = FALSE
ORDER BY updated_at DESC;

-- Count by status
SELECT image_validation_status, COUNT(*) as count
FROM products
GROUP BY image_validation_status;
```

## Troubleshooting

### Script Fails to Connect
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Check environment variables in `.env.local`

### API Returns 401
- Add your user ID to a whitelist or implement proper auth
- Check the authentication logic in the route

### Images Marked as Broken But They're Valid
- The URL might require authentication headers
- Consider adding `Authorization` headers to the validation fetch
- Some CDNs block HEAD requests; the script falls back to GET

### Want to Save Specific Images
Before running, export the data:
```sql
SELECT * FROM product_images WHERE url LIKE '%broken-cdn%'
```

Then recreate the images with valid URLs after cleanup.

## Next Steps

1. ✅ Run the migration on your Supabase database
2. ✅ Test the script on a non-production environment first
3. ✅ Review the broken images report
4. ✅ Run cleanup on production when ready
5. ✅ Monitor the `broken_product_images` table for audit trail

---

**Need help?** Check your Supabase logs and the `broken_product_images` table for debugging.
