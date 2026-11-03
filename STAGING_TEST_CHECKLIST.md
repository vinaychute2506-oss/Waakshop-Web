# WAAK Phase 2.3 — Staging Acceptance Test Checklist

Use this structured test protocol on the staging HTTPS deployment before moving to live payment configuration.

---

## 1. Automated Health & Integration Verification

- [ ] **API Health Endpoint**: `GET https://api.staging.waak.in/health` returns `HTTP 200`, `status: 'ok'`, and `isTestPaymentMode: true`.
- [ ] **Database Connection Pool**: Response confirms PostgreSQL connection is active with zero connection leakage.
- [ ] **HTTPS & Security Headers**:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-XSS-Protection: 1; mode=block`
- [ ] **CORS Restriction**: Requests from unauthorized domains are rejected.

---

## 2. Customer Authentication & Account Security

- [ ] **Customer Registration**: New user can sign up with valid email and password (>= 6 characters).
- [ ] **Password Hashing**: Database `customers.password_hash` contains secure bcrypt salt and hash.
- [ ] **Customer Login**: Generates a valid 30-day JWT session token.
- [ ] **Brute Force Protection**: Exceeding 10 failed login attempts in 15 minutes triggers `HTTP 429 Too Many Requests`.
- [ ] **Customer Address Book**: Adding/editing bespoke delivery addresses persists in `customer_addresses` table.
- [ ] **Account Persistence**: Refreshing the browser preserves the active customer session.

---

## 3. Shopping Bag & Catalog Concurrency

- [ ] **Catalog Integrity**: 4 occasionwear garments display correct INR prices, descriptions, and high-resolution images.
- [ ] **Size Selection**: Available sizes (38, 40, 42, 44) can be chosen; invalid sizes return `HTTP 400`.
- [ ] **Quantity Limits**: Quantity inputs strictly between 1 and 10 pieces.
- [ ] **Cross-Customer Isolation**: Customer B cannot inspect, update, or inject items into Customer A's cart (`HTTP 403`).
- [ ] **Cart Database Persistence**: Cart line items remain intact across page reloads and logins.
- [ ] **Accurate Subtotal Calculation**: Server recomputes totals and GST (12%) from database prices.

---

## 4. Razorpay Sandbox Checkout & Payment Integrity

- [ ] **Order Initialization**: Clicking "Proceed to Bespoke Checkout" creates order and issues Razorpay Order ID.
- [ ] **Display Reference**: Bespoke order reference formatted as `WAAK-2026-XXXX`.
- [ ] **Test Card Payment**: Razorpay test card transaction completes successfully.
- [ ] **HMAC Signature Verification**: Backend verifies `razorpay_signature` using HMAC-SHA256 with `crypto.timingSafeEqual`.
- [ ] **Atomic Inventory Decrement**: Garment variant stock quantity decrements exactly by the purchased quantity.
- [ ] **Payment Idempotency**: Duplicate `/verify` calls or replay attacks return cached confirmation without double-decrementing stock.
- [ ] **Razorpay Webhook Verification**:
  - Unsigned webhooks rejected with `HTTP 400`.
  - Tampered webhooks rejected with `HTTP 400`.
  - Authentic `payment.captured` webhooks processed cleanly.
  - Duplicate webhook delivery does not decrement stock twice.
  - `payment.failed` event updates order and payment record to `failed`.

---

## 5. Atelier Admin Operations Console

- [ ] **Admin Authentication**: Accessing `https://api.staging.waak.in/admin` prompts for credentials.
- [ ] **Customer Access Block**: Standard customer token rejected on admin endpoints (`HTTP 403 Forbidden`).
- [ ] **Dashboard Metrics**: Gross revenue, order counts, and active customers tally accurately.
- [ ] **Low Stock Alerts**: Displays garments with remaining stock <= 4 pieces.
- [ ] **Fulfillment Status Updates**: Admin can transition orders (`pending` -> `processing` -> `shipped` -> `delivered`).

---

## 6. Luxury Storefront Presentation (V3.2.1 Preservation)

- [ ] **Curtain Opening Reveal**: Velvet panels open smoothly on desktop and mobile without content flashing through.
- [ ] **Navbar Centering**: WAAK wordmark remains optically centered between navigation links and utility controls.
- [ ] **Category Navigation**: 80px circular badges with gold border hover states.
- [ ] **Product Grid**: 3:4.3 portrait cards with aligned titles and price baselines.
- [ ] **Cart Drawer**: Smooth fly-out animation and responsive checkout buttons.
