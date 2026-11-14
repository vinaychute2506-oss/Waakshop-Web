-- Migration 004: Add size 36 variants across all catalog products
-- Inventory is initialized to 0 pending authoritative client entry via Atelier Admin

INSERT INTO product_variants (id, product_id, title, sku, size, stock_quantity, reserved_quantity, price)
SELECT 
    'var_' || p.id || '_36' AS id,
    p.id AS product_id,
    'Size 36' AS title,
    'WAAK-' || UPPER(p.id) || '-36' AS sku,
    '36' AS size,
    0 AS stock_quantity,
    0 AS reserved_quantity,
    p.price AS price
FROM products p
ON CONFLICT (sku) DO NOTHING;
