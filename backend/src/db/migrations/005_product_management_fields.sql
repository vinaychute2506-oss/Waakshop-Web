-- Migration 005: Add product publishing, compare-at pricing, and collection fields
-- WAAK Luxury Occasionwear Commerce Platform

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS collection VARCHAR(100) DEFAULT '';

-- Backfill existing products so is_published is true
UPDATE products SET is_published = TRUE WHERE is_published IS NULL;

-- Index for filtering published products on storefront
CREATE INDEX IF NOT EXISTS idx_products_is_published ON products(is_published);
