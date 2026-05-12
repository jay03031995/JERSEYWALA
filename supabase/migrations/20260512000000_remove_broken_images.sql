-- Migration: Remove products with broken image links
-- This migration identifies and deactivates products that have broken image URLs

-- First, let's create a table to track which products have broken images
CREATE TABLE IF NOT EXISTS broken_product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_id UUID REFERENCES product_images(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  error_message TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index for tracking
CREATE INDEX IF NOT EXISTS idx_broken_product_images_product_id ON broken_product_images(product_id);

-- Function to check for products with no valid images
CREATE OR REPLACE FUNCTION identify_products_with_broken_images()
RETURNS TABLE (product_id UUID, product_name TEXT, image_count INTEGER, status TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    COUNT(pi.id)::INTEGER as image_count,
    CASE 
      WHEN COUNT(pi.id) = 0 THEN 'NO_IMAGES'
      ELSE 'HAS_IMAGES'
    END as status
  FROM products p
  LEFT JOIN product_images pi ON p.id = pi.product_id
  WHERE p.is_active = TRUE
  GROUP BY p.id, p.name
  HAVING COUNT(pi.id) = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to deactivate products with no images
CREATE OR REPLACE FUNCTION deactivate_products_with_no_images()
RETURNS TABLE (product_id UUID, product_name TEXT, action TEXT) AS $$
BEGIN
  RETURN QUERY
  UPDATE products p
  SET is_active = FALSE, updated_at = NOW()
  WHERE p.id IN (
    SELECT p2.id
    FROM products p2
    LEFT JOIN product_images pi ON p2.id = pi.product_id
    WHERE p2.is_active = TRUE
    GROUP BY p2.id
    HAVING COUNT(pi.id) = 0
  )
  RETURNING p.id, p.name, 'DEACTIVATED'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Add a column to track if a product has been checked for broken images
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_validation_status TEXT DEFAULT 'PENDING';

-- Create an index for the new column
CREATE INDEX IF NOT EXISTS idx_products_image_validation_status ON products(image_validation_status);
