# WAAK Phase 3.0 — Changed Files Register

**Date**: November 3, 2026  
**Branch**: `feature/phase3-commerce-blockers` (Branched from `phase2-backend` at commit `2f856d9`)  
**Frozen Baseline**: `waak-v3.1-client-preview` (Commit `ae75687` preserved)  

---

## 1. Summary of Changes

| File Path | Component / Layer | Primary Purpose | Lines Changed |
| :--- | :--- | :--- | :--- |
| `src/data/products.ts` | Frontend Data Model | Harmonize product IDs (`waak-01`..`waak-04`), authentic pricing, and Indian chest sizes (`38`, `40`, `42`, `44`). Added `findProduct` helper. | +130 / -43 |
| `src/ProductDetail.tsx` | Storefront PDP Component | Dynamic variant fetching from backend API, real stock validation, Indian chest sizing buttons, out-of-stock disabling, and interactive Bespoke Size Guide modal. | +384 / -52 |
| `src/components/CheckoutModal.tsx` | Checkout & Payment Modal | Removed silent `.catch(() => {})`, eliminated brittle substring mapping, added pre-flight cart validation, and integrated clear error reporting. | +77 / -25 |
| `src/context/AppContext.tsx` | Global Application State | Enabled `findProduct` resolution supporting both canonical IDs (`waak-01`) and legacy slugs (`ivory-embroidered-sherwani`). Added size validation on cart insertion. | +27 / -5 |

---

## 2. Detailed File Inspection & Before/After Analysis

### 2.1 `src/data/products.ts`
- **Why Changed**:
  - Resolve **BUG-02**: Frontend used arbitrary mock slugs (`ivory-embroidered-sherwani`, etc.) with mock prices (`₹24,500`), while PostgreSQL used relational IDs (`waak-01`) with authentic luxury couture pricing (`₹49,500`).
- **Before**:
  - Products identified only by string slugs.
  - Sizing not defined on product objects.
  - Price in frontend (`₹24,500`) mismatched backend server price (`₹49,500`).
- **After**:
  - Canonical `id` and `backendId` mapped to `waak-01`, `waak-02`, `waak-03`, `waak-04`.
  - Authoritative pricing aligned with backend database:
    - `waak-01`: ₹49,500
    - `waak-02`: ₹54,500
    - `waak-03`: ₹38,500
    - `waak-04`: ₹24,500
  - Added `availableSizes: ["38", "40", "42", "44"]`.
  - Products 5–9 explicitly tagged `isAvailableInBackend: false` (Archival designs).
  - Exported `findProduct(idOrSlug)` providing transparent resolution for both new canonical IDs and legacy URLs.

---

### 2.2 `src/ProductDetail.tsx`
- **Why Changed**:
  - Resolve **BUG-01**: Hardcoded Western letter sizes (`["S", "M", "L", "XL", "XXL"]`) with default `"M"` were triggering `HTTP 400: Invalid size 'M'` when adding to cart.
- **Before**:
  - Hardcoded `const sizes = ["S", "M", "L", "XL", "XXL"]`.
  - Default state was `useState("M")`.
  - No check against live variant stock in the database.
  - Size Guide was an ugly browser `alert()`.
- **After**:
  - Dynamically fetches product variants and stock levels from `api.products.get(targetId)`.
  - Sizes rendered as Indian occasionwear chest sizes (`38`, `40`, `42`, `44`).
  - Default size selects `'40'` **only if in stock**; otherwise falls back to the first available in-stock size, or requires user selection if sold out.
  - Sizes with `stock_quantity <= 0` are visually styled as out-of-stock, disabled, and cannot be clicked.
  - Replaced browser `alert()` with an interactive **Bespoke Size Guide modal** providing metric and imperial chest/shoulder measurements.
  - Archival pieces (`isAvailableInBackend === false`) display an "Atelier Archive" badge with bespoke consultation prompts.

---

### 2.3 `src/components/CheckoutModal.tsx`
- **Why Changed**:
  - Resolve **BUG-03**: `.catch(() => {})` was silently swallowing line-item addition failures, leaving the backend cart empty and presenting a misleading *"Your bespoke shopping bag is empty"* error.
- **Before**:
  - Brittle heuristic mapping: `if (backendProdId.includes('ivory')) backendProdId = 'waak-01'`.
  - Silent error swallowing: `await api.cart.addItem(...).catch(() => {})`.
  - Failure to add an item did not block checkout from proceeding to payment.
- **After**:
  - Clean canonical mapping: `const backendProdId = item.product.backendId || item.product.id`.
  - Pre-flight validation checks every piece in the bag for valid size and backend availability.
  - Explicit error handling: Any line-item rejection throws a descriptive error specifying the exact product name and size.
  - Failed operations preserve user form data and cart items without falsely advancing the flow.
  - Duplicate click protection with `if (loading) return;` and `disabled={loading}`.

---

### 2.4 `src/context/AppContext.tsx`
- **Why Changed**:
  - Ensure global cart state and product navigation handle both canonical relational IDs and legacy slugs seamlessly.
- **Before**:
  - Hardcoded default `selectedProductId` to `"ivory-embroidered-sherwani"`.
  - Cart equality check strictly checked `item.product.id === product.id`.
- **After**:
  - Initial `selectedProductId` defaults to `"waak-01"`.
  - Uses `findProduct()` to resolve either `waak-01` or `ivory-embroidered-sherwani`.
  - `addToCart` validates that `size` is non-empty before updating state.
  - Item matching supports both `id` and `slug`.
