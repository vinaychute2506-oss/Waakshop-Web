# WAAK Phase 3.1 — Regression & Test Report
**Test Suite Verification & Quality Assurance**

**Date:** November 2026  
**Execution Environment:** Windows PowerShell / Node.js 20.x  
**PostgreSQL Container:** `waak-postgres` (Port 5432)  
**Redis Container:** `waak-redis` (Port 6379)  
**Active Services:**
- Local API Gateway: `http://localhost:9000`
- Local Storefront: `http://localhost:5173`
- Staging API Container: `http://localhost:9001`
- Staging Storefront Nginx: `http://localhost:8088`

---

## 1. Test Summary

| Test Suite | File Path | Assertions Run | Passed | Failed |
|---|---|:---:|:---:|:---:|
| **Phase 3.1 Dedicated E2E** | `scratch/test-phase-3-1-e2e.mjs` | 49 | 49 | 0 |
| **Backend Commerce Audit** | `backend/test-backend.js` | 40 | 40 | 0 |
| **Staging Environment Audit** | `backend/test-staging.js` | 49 | 49 | 0 |
| **Phase 3.0 Commerce Core E2E** | `scratch/test-phase-3-0-e2e.mjs` | 34 | 34 | 0 |
| **Total Automated Assertions** | — | **172** | **172** | **0** |

---

## 2. Compilation & Build Verification

### 2.1 Frontend Build (`npm run build`)
- Command: `tsc -b && vite build`
- Result: **SUCCESS (0 errors)**
- Build Output:
  ```
  dist/index.html                   0.81 kB │ gzip:  0.47 kB
  dist/assets/index-Dcf6tnWc.css   33.38 kB │ gzip:  7.06 kB
  dist/assets/index-CNR91TH_.js   332.83 kB │ gzip: 93.73 kB
  ✓ built in 997ms
  ```

### 2.2 Backend Build (`npm --prefix backend run build`)
- Command: `tsc && node -e "fs.mkdirSync... fs.cpSync..."`
- Result: **SUCCESS (0 errors)**
- Migrations & schema copied to `dist/db/`.

---

## 3. Phase 3.1 Test Suite Breakdown (`scratch/test-phase-3-1-e2e.mjs`)

### 3.1 Dynamic Catalog Verification (17 Assertions)
- `[PASS]` Catalog endpoint (`/store/products`) returns HTTP 200 OK
- `[PASS]` Catalog payload contains products array
- `[PASS]` Catalog contains exactly 4 canonical products
- `[PASS]` Product `waak-01` verified at authoritative price ₹49,500
- `[PASS]` Product `waak-01` has 4 chest sizes: `['38', '40', '42', '44']`
- `[PASS]` Product `waak-02` verified at authoritative price ₹54,500
- `[PASS]` Product `waak-02` has 4 chest sizes: `['38', '40', '42', '44']`
- `[PASS]` Product `waak-03` verified at authoritative price ₹38,500
- `[PASS]` Product `waak-03` has 4 chest sizes: `['38', '40', '42', '44']`
- `[PASS]` Product `waak-04` verified at authoritative price ₹24,500
- `[PASS]` Product `waak-04` has 4 chest sizes: `['38', '40', '42', '44']`

### 3.2 Address PIN Code Validation (11 Assertions)
- `[PASS]` Customer registered with JWT token
- `[PASS]` 5-digit PIN (`11000`) rejected with HTTP 400
- `[PASS]` 7-digit PIN (`1100001`) rejected with HTTP 400
- `[PASS]` Alphanumeric PIN (`11000A`) rejected with HTTP 400
- `[PASS]` Foreign Postal Code (`SW1A1A`) rejected with HTTP 400
- `[PASS]` Empty PIN rejected with HTTP 400
- `[PASS]` Informative format error returned for all invalid address attempts
- `[PASS]` Valid 6-digit PIN (`110003`) accepted with HTTP 201

### 3.3 Checkout PIN Code & Order Flow (19 Assertions)
- `[PASS]` Checkout with 5-digit PIN rejected with HTTP 400
- `[PASS]` Checkout with 7-digit PIN rejected with HTTP 400
- `[PASS]` Checkout with Alphanumeric PIN rejected with HTTP 400
- `[PASS]` Checkout with UK Postal Code rejected with HTTP 400
- `[PASS]` Checkout with Empty PIN rejected with HTTP 400
- `[PASS]` Checkout errors explicitly cite 6-digit Indian PIN code requirement
- `[PASS]` Checkout with valid 6-digit PIN (`110003`) initiated successfully (HTTP 201)
- `[PASS]` Order created with server ID
- `[PASS]` Razorpay test order ID generated
- `[PASS]` Test payment verification succeeded with HTTP 200
- `[PASS]` Order transitioned to "paid" status
- `[PASS]` Confirmed order retains 6-digit PIN in PostgreSQL delivery record

### 3.4 Whitespace Trimming Verification (2 Assertions)
- `[PASS]` PIN code with leading/trailing whitespace (`"  110001  "`) cleanly trimmed and accepted (HTTP 201)
- `[PASS]` Order created for trimmed PIN code

---

## 4. Preservation of Frozen Tag & Storefront Aesthetics

- **Baseline Tag**: `waak-v3.1-client-preview` verified via `git rev-parse waak-v3.1-client-preview` -> `097dfb1baf38a008c97488c75c5912599024652c`.
- **Aesthetic Consistency**:
  - Fonts: Cormorant Garamond / Cinzel headers, Montserrat metadata.
  - Colors: Deep Burgundy (`#5A121A`), Metallic Gold (`#C5A265`), Warm Cream (`#F4EFE6`).
  - Layout: 80px circular category selectors, 3:4.3 product card proportions, and velvet curtain reveal overlay preserved without disruption.
