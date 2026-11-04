# WAAK — Checkout Security & Customer Trust Review

**Document Purpose**: Evidence-Based Review of Checkout Protections & Customer Trust Design  
**Operating Mode**: Controlled Staging Only · Razorpay Sandbox (Test Mode)  
**Standard**: Rigorous Verification Against Actual Codebase Implementation

---

## 1. Verified Technical Protections Implemented in Code

Customer trust must be anchored strictly in verified code architecture rather than promotional or unverified marketing assertions. The following 6 security and integrity layers are currently verified in the WAAK backend:

### Layer 1: Server-Authoritative Price Calculation
- **Implementation File**: [`backend/src/routes/checkout.ts:43-66`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/backend/src/routes/checkout.ts#L43-L66)
- **Mechanism**: When a patron initiates checkout, the backend reads unit prices and active promotions directly from the authoritative PostgreSQL database (`products.price` and `product_variants.price`).
- **Protection**: Any client-side total, manipulated cart payload, or browser storage override is completely ignored. The order total is calculated on the server and passed directly to Razorpay's Order Creation API in paise (`Math.round(total * 100)`).
- **Test Evidence**: `test-phase-3-0-e2e.mjs` assertions 18-20 confirm authoritative server price enforcement.

### Layer 2: Concurrency & Atomic Inventory Validation
- **Implementation File**: [`backend/src/routes/checkout.ts:202-258`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/backend/src/routes/checkout.ts#L202-L258)
- **Mechanism**: Inventory decrement executes inside a database transaction (`BEGIN ... COMMIT`) utilizing row-level database locking:
  `SELECT stock_quantity FROM product_variants WHERE id = $1 FOR UPDATE`
- **Protection**: If two patrons attempt to purchase the final available size 40 sherwani simultaneously, the database serializes the locks. The first transaction succeeds; the second receives an explicit HTTP 409 Conflict with an informative message (`"Insufficient stock for The Ivory Zardozi Sherwani (Size 40)"`). No overselling is mathematically possible.
- **Test Evidence**: `backend/test-backend.js` assertion 23 verifies atomic stock decrement.

### Layer 3: Cryptographic HMAC-SHA256 Signature Verification
- **Implementation File**: [`backend/src/routes/checkout.ts:160-188`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/backend/src/routes/checkout.ts#L160-L188)
- **Mechanism**: Following payment authorization, Razorpay returns `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`. The backend recomputes:
  `crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(order_id + '|' + payment_id).digest('hex')`
- **Protection**: Verification uses `crypto.timingSafeEqual` in `safeCompare()`. If the signature does not match bit-for-bit, or if a user attempts to spoof a payment ID without the secret key, the request is rejected with HTTP 400.
- **Test Evidence**: `backend/test-backend.js` assertion 21-22 confirms cryptographic signature verification.

### Layer 4: Webhook Replay & Idempotency Guards
- **Implementation File**: [`backend/src/routes/checkout.ts:214-227, 341-380`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/backend/src/routes/checkout.ts#L214-L227)
- **Mechanism**: The backend inspects order status before applying state transitions. If an order is already marked `payment_status = 'captured'`, repeated verification requests or replayed webhooks return the existing order record with `idempotent: true`.
- **Protection**: Network retries, duplicate browser refreshes, or malicious webhook replays cannot trigger double stock decrements or duplicate charges.
- **Test Evidence**: `backend/test-backend.js` assertion 24-25 and 30 confirm idempotency protection.

### Layer 5: Strict Customer Data Isolation
- **Implementation Files**: [`backend/src/routes/carts.ts:45-55`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/backend/src/routes/carts.ts#L45-L55), [`backend/src/routes/orders.ts:15-22`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/backend/src/routes/orders.ts#L15-L22)
- **Mechanism**: Carts, saved addresses, and order histories are strictly bound to the authenticated patron's `customer_id` extracted from their validated JWT session.
- **Protection**: If Customer B attempts to view or modify Customer A's cart or order via ID manipulation, the API immediately halts with `HTTP 403 Forbidden`.
- **Test Evidence**: `backend/test-backend.js` assertions 15-17 and 20 confirm cross-customer access rejection.

### Layer 6: Test-Mode Runtime Lock
- **Implementation File**: [`backend/src/config.ts:86-90`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/backend/src/config.ts#L86-L90)
- **Mechanism**: A hard runtime assertion halts the Node.js server upon startup if any `rzp_live_*` key is supplied.
- **Protection**: Guarantees that accidental configuration changes cannot route real customer credit cards or initiate live transactions in staging.

---

## 2. Customer-Facing Trust Presentation Recommendations

Based **strictly on verified capabilities**, the storefront should communicate safety and reassurance without overpromising or making legally hazardous claims:

### What WE CAN Claim (Verified in Code)
1. **"Official Razorpay Secure Payment Gateway"**: True — orders integrate with Razorpay's PCI-DSS compliant checkout modal.
2. **"Encrypted Order Verification"**: True — transactions use 256-bit SSL in transit and server-side HMAC-SHA256 signature verification.
3. **"Direct Atelier Stock Reservation"**: True — inventory is decremented and reserved atomically in real time.
4. **"Indian PIN Code Delivery Check"**: True — postal format is validated prior to payment capture.

### What WE MUST NOT Claim (Unverified / Unapproved)
1. ❌ **"PCI Level 1 Certified Boutique"**: False — Razorpay itself is PCI-DSS Level 1 compliant, but the WAAK organization has not undergone a formal PCI ROC/AOC audit.
2. ❌ **"100% Insured Air Transit Guaranteed"**: Unconfirmed — logistics partners (e.g. Blue Dart, Delhivery) have not yet signed commercial service-level agreements.
3. ❌ **"Instant Money-Back Guarantee Within 24 Hours"**: Unconfirmed — refund processing workflows and merchant banking clearance terms are not finalized by the business.
4. ❌ **"ISO 27001 Certified Infrastructure"**: False — no certification exists.

---

## 3. Recommended Trust UI Implementation

### In `CheckoutModal.tsx` (Directly above submit button):
```
┌────────────────────────────────────────────────────────┐
│  🔒 SECURE CHECKOUT WITH WAAK ATELIER                  │
│                                                        │
│  • Official Razorpay Payment Gateway (Test Mode)       │
│  • Server-Verified Cryptographic Order Security        │
│  • Direct Atelier Stock Reservation Upon Confirmation  │
│  • 6-Digit Indian Postal Index Delivery Validation     │
└────────────────────────────────────────────────────────┘
```

### On Product Detail Page (Beneath Add to Bag):
```
┌────────────────────────────────────────────────────────┐
│  [Shield Icon] Guaranteed Atelier Authenticity         │
│  [Lock Icon]   Encrypted Checkout via Razorpay         │
│  [Box Icon]    Handcrafted to Order · 7-Day Exchange*  │
│  * Exchange terms subject to business draft policy     │
└────────────────────────────────────────────────────────┘
```
