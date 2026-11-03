# WAAK Catalog API & Data Mapping Specification
**Phase 3.1 Architecture Reference**

---

## 1. Catalog Architecture Overview

The WAAK storefront utilizes a hybrid catalog model combining authoritative server-side inventory and pricing with editorial storytelling:
1. **Authoritative Backend Data (PostgreSQL)**:
   - Product IDs: `waak-01`, `waak-02`, `waak-03`, `waak-04`
   - Sizing: Standard Indian men's occasionwear chest sizes `[38, 40, 42, 44]`
   - Pricing: Authoritative INR prices (e.g., ₹49,500)
   - Stock: Real-time atomic decrements on order capture
2. **Editorial Front-End Enrichment (`src/data/products.ts`)**:
   - High-resolution editorial lookbook galleries
   - Merchandising tags (e.g. *Just In*, *Best Seller*, *Occasion Type*)
   - Fabric compositions and heritage craftsmanship stories
3. **Archival Bespoke Models**:
   - Products 5–9 (`black-tailored-suit`, `navy-structured-blazer`, etc.) represent custom couture silhouettes.
   - Identified by `isAvailableInBackend: false`.
   - Customers can browse and view them in lookbooks, while add-to-cart directs patrons to private atelier consultations.

---

## 2. Product Mapping Matrix

| Backend ID | Display Slug | Garment Name | Category | Available Sizes | Authoritative Price | Backend Status |
|---|---|---|---|:---:|:---:|:---:|
| `waak-01` | `royal-ivory-sherwani` | THE IVORY ZARDOZI SHERWANI | Indian Wear | 38, 40, 42, 44 | ₹49,500 | Live (In Stock) |
| `waak-02` | `midnight-velvet-sherwani` | MIDNIGHT VELVET SHERWANI | Indian Wear | 38, 40, 42, 44 | ₹54,500 | Live (In Stock) |
| `waak-03` | `mauve-bandhgala` | MAUVE RAW SILK BANDHGALA | Indo Western & Jodhpuri | 38, 40, 42, 44 | ₹38,500 | Live (In Stock) |
| `waak-04` | `emerald-kurta` | EMERALD TUSSAR SILK KURTA | Kurta Sets | 38, 40, 42, 44 | ₹24,500 | Live (In Stock) |
| *N/A* | `black-tailored-suit` | THE OBSIDIAN PEAK TUXEDO | Suits & Blazers | Custom Atelier | ₹68,500 | Archival Preview |
| *N/A* | `navy-structured-blazer` | ROYAL NAVY DOUBLE-BREASTED | Suits & Blazers | Custom Atelier | ₹42,000 | Archival Preview |
| *N/A* | `silk-blend-kurta` | CHAMPAGNE CHANDERI KURTA | Kurta Sets | Custom Atelier | ₹28,000 | Archival Preview |
| *N/A* | `brocade-waistcoat` | GOLDEN ZARI BROCADE BUNDI | Waistcoats | Custom Atelier | ₹22,500 | Archival Preview |
| *N/A* | `classic-bandhgala` | CHARCOAL HERITAGE JODHPURI | Indo Western & Jodhpuri | Custom Atelier | ₹52,000 | Archival Preview |

---

## 3. Hydration & Fallback Logic

### 3.1 Dynamic Fetch Flow
```
Storefront Init (AppContext)
       │
       ▼
GET /store/products
       ├───► [Success] ──► Merge backend variants & live prices with static editorial assets
       │                    Set catalogLoading = false
       │
       └───► [Network/Server Error] ──► Fallback to cached catalog
                                        Set catalogError notice
                                        Enable "Retry Link" action
```

### 3.2 Size Resolution Priority
1. **Live Variants**: When `/store/products/:id` resolves, `res.product.variants` provides real-time stock quantities for each chest size (`38`, `40`, `42`, `44`).
2. **Default Selection**: Automatically defaults to size `40` (the standard sample size) if in stock, or the first available in-stock variant.
3. **Out-of-Stock Guard**: Prevents adding sizes where `stock_quantity <= 0`.
