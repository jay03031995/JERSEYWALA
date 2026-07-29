-- Accessories such as keychains and trophies use a single inventory variant.
ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_size_check;
ALTER TABLE product_variants
  ADD CONSTRAINT product_variants_size_check
  CHECK (size IN ('OS','XS','S','M','L','XL','XXL','3XL'));
