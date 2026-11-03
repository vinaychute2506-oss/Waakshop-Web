# WAAK E-Commerce — Bugs, Defects & Technical Gaps Register

**Audit Date**: November 3, 2026  
**Auditor**: Senior QA Engineer & Lead Security Architect  
**Repository Branch**: `phase2-backend` (Commit `2f856d9`)  
**Status**: Comprehensive Assessment Completed (Zero Application Changes Made)  

---

## 1. Executive Issue Summary

| Issue ID | Severity | Category | Title | Affected File / Component | Effort |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | **High** | Functional / Sizing | ProductDetail uses Western sizes (S–XXL) while Backend enforces Indian Chest sizes (38–44) | `src/ProductDetail.tsx:16` | Medium (1–2h) |
| **BUG-02** | **High** | Data / Integration | Catalog ID & Price Discrepancy between Frontend Mock Data and PostgreSQL Schema | `src/data/products.ts` | Medium (2–3h) |
| **BUG-03** | **Medium** | Functional / UX | Silent error swallowing in `CheckoutModal.tsx` on line-item failure | `src/components/CheckoutModal.tsx:78` | Quick (<1h) |
| **BUG-04** | **Low** | Resilience / UI | Remote Unsplash image dependencies without local cached asset fallbacks | `src/data/products.ts` | Medium (1–2h) |
| **GAP-01** | **Medium** | Legal / Compliance | Footer legal links (Privacy, Terms, Care) are unlinked static spans | `src/components/Footer.tsx:195` | Medium (2–3h) |
| **GAP-02** | **Low** | Feature Gap | Newsletter subscription form displays preview toast without backend API | `src/components/Footer.tsx:135` | Quick (<1h) |
| **GAP-03** | **Low** | Notifications | Admin order status changes do not trigger automated customer transactional emails | `backend/src/routes/admin.ts` | Major (>4h) |
| **ISSUE-01**| **Low** | Validation / UX | Frontend checkout address form lacks strict 6-digit Indian PIN code format enforcement | `src/components/CheckoutModal.tsx:110`| Quick (<1h) |
| **ISSUE-02**| **Low** | Accessibility | Custom size selectors and luxury icon buttons lack high-contrast focus rings | `src/ProductDetail.tsx`, `src/components/Navbar.tsx` | Quick (<1h) |

---

## 2. Exhaustive Bug Analysis & Remediation Specs

### BUG-01: Product Detail Sizing Discrepancy
- **Severity**: **High**
- **Category**: Functional / Sizing
- **Affected File**: `src/ProductDetail.tsx` (Line 16)
- **Steps to Reproduce**:
  1. Open storefront at `http://localhost:5173/product` or via Staging Nginx at `http://localhost:8088/product`.
  2. The page loads with default selected size `"M"`.
  3. Click **"Add to Bag"** or proceed to **"Order Bespoke"**.
  4. The checkout process attempts to create a backend cart line-item using `size: "M"`.
- **Expected Behavior**:
  Sizes should conform to the luxury Indian menswear occasionwear chest sizing standard (`38`, `40`, `42`, `44`, `46`), matching backend schema validation in `backend/src/routes/carts.ts:120`.
- **Actual Behavior**:
  The backend API rejects the request with `HTTP 400 Bad Request: "Invalid size 'M'. Available sizes: 38, 40, 42, 44"`.
- **Root Cause**:
  `src/ProductDetail.tsx` hardcodes `const SIZES = ["S", "M", "L", "XL", "XXL"]` with `useState("M")`, whereas the PostgreSQL database catalog (`backend/src/db/seed.ts`) and cart validator enforce `['38', '40', '42', '44']`.
- **Impact**:
  A customer attempting to purchase directly from the Product Detail Page will trigger an API error that prevents cart line-item synchronization.
- **Recommended Fix (Do Not Apply During Audit)**:
  Update `src/ProductDetail.tsx` to read sizes dynamically from `product.sizes || ['38', '40', '42', '44']` and set default state to `'40'`. Provide an interactive Bespoke Size Guide modal explaining chest measurements in inches and centimeters.

---

### BUG-02: Product Catalog & ID Discrepancy
- **Severity**: **High**
- **Category**: Data / Integration
- **Affected Files**: `src/data/products.ts`, `src/ProductDetail.tsx`, `src/components/CheckoutModal.tsx`
- **Steps to Reproduce**:
  1. Inspect `src/data/products.ts`. Products are identified by string slugs: `'ivory-embroidered-sherwani'`, `'midnight-velvet-sherwani'`, etc., with mock prices like `₹24,500`.
  2. Inspect PostgreSQL database catalog via `GET /store/products`. Products are keyed by relational IDs: `'waak-01'`, `'waak-02'`, etc., with authentic luxury couture pricing (`₹49,500`, `₹78,000`).
  3. In `CheckoutModal.tsx:75`, a brittle heuristic string replacement exists: `if (backendProdId.includes('ivory')) backendProdId = 'waak-01'`.
- **Expected Behavior**:
  Frontend components should consume the unified product catalog from the backend API (`api.products.list()`), or maintain exact synchronization with PostgreSQL product IDs and currency values.
- **Actual Behavior**:
  Heuristic ID mapping only covers sherwani items; any new catalog items added by the admin will fail to map during checkout.
- **Root Cause**:
  Frontend was developed as a standalone luxury prototype using static mock JSON before the relational database schema was implemented in Phase 2.
- **Impact**:
  Price discrepancies between the visual preview and server-calculated checkout totals, risking cart checkout confusion.
- **Recommended Fix (Do Not Apply During Audit)**:
  Unify `src/data/products.ts` with backend IDs (`waak-01` through `waak-04`) and true pricing, or connect the product catalog state directly to `api.products.list()` with a fallback cache.

---

### BUG-03: Silent Error Swallowing in Checkout Modal
- **Severity**: **Medium**
- **Category**: Functional / UX
- **Affected File**: `src/components/CheckoutModal.tsx` (Line 78)
- **Code Reference**:
  ```typescript
  await api.cart.addItem(cartId, backendProdId, 1, size).catch(() => {});
  ```
- **Steps to Reproduce**:
  1. Trigger a line-item addition that fails validation (e.g. invalid size from BUG-01 or an out-of-stock variant).
  2. The `.catch(() => {})` silently swallows the `HTTP 400 / 500` error without alerting the customer.
  3. Next, `api.checkout.initiate(cartId, ...)` executes on an empty backend cart.
  4. The checkout initiation fails with `HTTP 400: "Your bespoke shopping bag is empty"`.
- **Expected Behavior**:
  If line-item addition fails, the checkout modal should catch the specific error message and display a graceful, luxury-styled warning: *"We could not reserve this bespoke piece in size [X]. Please choose an available chest size."*
- **Actual Behavior**:
  The modal progresses to the checkout step, displays a generic error message, and disorients the user.
- **Root Cause**:
  Defensive coding in frontend prototype used empty catch blocks to prevent unhandled promise rejections.
- **Recommended Fix (Do Not Apply During Audit)**:
  Remove empty catch handler; capture `err.response?.data?.message` and surface actionable feedback in the modal UI.

---

### BUG-04: Remote Unsplash Image Dependencies
- **Severity**: **Low**
- **Category**: Resilience / UI
- **Affected File**: `src/data/products.ts`
- **Issue Description**:
  Product images rely on external Unsplash CDN URLs (`images.unsplash.com/photo-...`). If a client or staging tester is operating behind an enterprise firewall, offline, or experiencing Unsplash rate limits, imagery fails to load, falling back to empty containers.
- **Recommended Fix (Do Not Apply During Audit)**:
  Bundle compressed WebP thumbnails in `public/images/products/` and configure fallback `onError` handlers on all `<img>` tags.

---

### GAP-01: Unlinked Static Footer Spans
- **Severity**: **Medium**
- **Category**: Legal / Compliance
- **Affected File**: `src/components/Footer.tsx` (Lines 195–210)
- **Issue Description**:
  Links for **"Privacy Policy"**, **"Terms of Service"**, **"Atelier Location"**, and **"Care & Preservation"** are styled text spans (`<span>Privacy Policy</span>`) with hover effects but no `href`, `onClick`, or routing handlers.
- **Impact**:
  For an e-commerce platform accepting digital payments in India, missing Terms of Service and Privacy Policy pages violates RBI and consumer protection guidelines.
- **Recommended Fix (Do Not Apply During Audit)**:
  Add clean modal dialogs or static routes (`/privacy`, `/terms`, `/atelier`) containing WAAK's bespoke policies and atelier craftsmanship guidelines.

---

### GAP-02: Newsletter Subscription Preview Toast
- **Severity**: **Low**
- **Category**: Feature Gap
- **Affected File**: `src/components/Footer.tsx` (Lines 135–145)
- **Issue Description**:
  Submitting the newsletter form displays a temporary toast stating `"(Frontend Preview — Client integration pending)"`. No backend subscription endpoint exists (`/store/newsletter/subscribe`).
- **Recommended Fix (Do Not Apply During Audit)**:
  Implement a lightweight `POST /store/newsletter/subscribe` endpoint storing verified emails in PostgreSQL or integrating with a mailing provider (Mailchimp/Brevo).

---

### GAP-03: Missing Transactional Email Dispatch on Order Status Updates
- **Severity**: **Low**
- **Category**: Notifications / Operations
- **Affected File**: `backend/src/routes/admin.ts`
- **Issue Description**:
  When an admin changes an order status from `"paid"` to `"processing"` or `"fulfilled"`, the database record is updated, but no automated notification (email or WhatsApp/SMS) is queued or dispatched to the customer.
- **Recommended Fix (Do Not Apply During Audit)**:
  Integrate an asynchronous message queue (e.g. BullMQ on Redis) with an email transport (SendGrid, AWS SES, or Nodemailer) to dispatch transactional status updates.

---

### ISSUE-01: Missing Indian PIN Code Client-Side Validation
- **Severity**: **Low**
- **Category**: Validation / UX
- **Affected File**: `src/components/CheckoutModal.tsx` (Line 110)
- **Issue Description**:
  The PIN code input field accepts arbitrary alphanumeric input without checking for the standard 6-digit Indian Postal Index Number format (`^\d{6}$`).
- **Recommended Fix (Do Not Apply During Audit)**:
  Add pattern validation `pattern="[0-9]{6}"` and input masking to ensure immediate user feedback before network transmission.

---

### ISSUE-02: Missing High-Contrast Keyboard Focus Indicators
- **Severity**: **Low**
- **Category**: Accessibility (WCAG 2.4.7)
- **Affected Files**: `src/ProductDetail.tsx`, `src/components/Navbar.tsx`
- **Issue Description**:
  Size pill buttons and icon buttons rely on border color transitions that have insufficient contrast against dark backgrounds when navigating via `Tab` key.
- **Recommended Fix (Do Not Apply During Audit)**:
  Add `focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:outline-none` across all interactive buttons.
