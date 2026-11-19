-- Migration 006: Reconcile Storefront Archival Products into Admin Catalogue as DRAFT/UNPUBLISHED
-- Strict Safety Guard: Sets is_published = FALSE and stock_quantity = 0.
-- Does NOT activate public checkout or invent inventory allocations.

INSERT INTO products (
    id, title, subtitle, description, price, original_price, category, occasion,
    collection, is_new_arrival, is_bestseller, on_sale, is_published, thumbnail, images, created_at, updated_at
)
VALUES
  (
    'black-tailored-suit',
    'Black Tailored Suit',
    'Masterfully Tailored 3-Piece Evening Tuxedo',
    'Masterfully tailored 3-piece evening tuxedo featuring tone-on-tone hand-embroidered peak lapels, tailored waistcoat with metallic buttons, and structured Italian wool trousers.',
    18900,
    22000,
    'Suits & Blazers',
    'Formal',
    'Black Tie Evening',
    FALSE,
    TRUE,
    FALSE,
    FALSE, -- DRAFT / UNPUBLISHED: Not active in public storefront
    '/assets/products/black-tailored-suit.jpg',
    ARRAY['/assets/products/black-tailored-suit.jpg', '/assets/products/ice-blue-blazer.jpg'],
    NOW(),
    NOW()
  ),
  (
    'navy-waistcoat',
    'Navy Embroidered Waistcoat',
    'Contemporary Nehru Waistcoat in Rich Midnight Navy',
    'Contemporary Nehru waistcoat in rich midnight navy featuring ornate antique gold motif embroidery. Cut from pure raw silk and paired seamlessly over tailored ivory or cream kurtas.',
    4900,
    5800,
    'Waistcoats',
    'Festive',
    'Heritage Accents',
    FALSE,
    FALSE,
    FALSE,
    FALSE, -- DRAFT / UNPUBLISHED: Not active in public storefront
    '/assets/products/navy-waistcoat.jpg',
    ARRAY['/assets/products/navy-waistcoat.jpg', '/assets/products/powder-blue-waistcoat.jpg'],
    NOW(),
    NOW()
  ),
  (
    'cream-occasion-kurta',
    'Cream Occasionwear Set',
    'Pure Silk Festive Kurta Set with Artisanal Floral Resham',
    'Pure silk festive kurta set featuring an exquisite ombré fade from warm ivory into artisanal sage green, accentuated with detailed floral resham threadwork along the placket and cuffs.',
    14500,
    17000,
    'Kurta Sets',
    'Mehendi / Haldi',
    'Daytime Ceremonial',
    FALSE,
    FALSE,
    FALSE,
    FALSE, -- DRAFT / UNPUBLISHED: Not active in public storefront
    '/assets/products/cream-occasion-kurta.jpg',
    ARRAY['/assets/products/cream-occasion-kurta.jpg', '/assets/products/powder-blue-waistcoat.jpg'],
    NOW(),
    NOW()
  ),
  (
    'regal-velvet-sherwani',
    'Embroidered Ceremonial Sherwani',
    'Regal Mint and Pistachio Ceremonial Sherwani with Zardozi',
    'Regal mint and pistachio ceremonial sherwani adorned with comprehensive all-over zardozi threadwork, tailored for grand weddings. Complete with a coordinated ivory safa turban, pearl necklace, and embroidered organza stole.',
    32500,
    38000,
    'Indian Wear',
    'Wedding',
    'Royal Wedding Atelier',
    FALSE,
    TRUE,
    FALSE,
    FALSE, -- DRAFT / UNPUBLISHED: Not active in public storefront
    '/assets/products/regal-ceremonial-sherwani.jpg',
    ARRAY['/assets/products/regal-ceremonial-sherwani.jpg', '/assets/products/sage-indo-western.jpg'],
    NOW(),
    NOW()
  ),
  (
    'black-waistcoat',
    'Black Classic Waistcoat',
    'Sleek Black Double-Breasted Formal Waistcoat',
    'Sleek black double-breasted formal waistcoat with sculpted shawl collar, tailored welt pockets, and dual-column metallic buttons. An architectural modern statement for high-evening galas.',
    6500,
    7500,
    'Waistcoats',
    'Formal',
    'Black Tie Evening',
    FALSE,
    FALSE,
    FALSE,
    FALSE, -- DRAFT / UNPUBLISHED: Not active in public storefront
    '/assets/products/black-waistcoat.jpg',
    ARRAY['/assets/products/black-waistcoat.jpg'],
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Variants for all 5 draft garments: Sizes 36, 38, 40, 42, 44
-- Stock set strictly to 0 (Unallocated / Draft)
INSERT INTO product_variants (id, product_id, title, sku, size, stock_quantity, reserved_quantity, price)
SELECT
    'var_' || p.id || '_' || sz.size as id,
    p.id as product_id,
    p.title || ' - Size ' || sz.size as title,
    'WAAK-' || UPPER(REPLACE(p.id, '-', '_')) || '-' || sz.size as sku,
    sz.size,
    0 as stock_quantity, -- 0 Stock until atelier assigns real physical inventory
    0 as reserved_quantity,
    p.price
FROM products p
CROSS JOIN (VALUES ('36'), ('38'), ('40'), ('42'), ('44')) as sz(size)
WHERE p.id IN ('black-tailored-suit', 'navy-waistcoat', 'cream-occasion-kurta', 'regal-velvet-sherwani', 'black-waistcoat')
ON CONFLICT (id) DO NOTHING;
