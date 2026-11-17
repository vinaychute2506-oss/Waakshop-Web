# WAAK Occasionwear — Production Launch Blockers & Actionable Path to Resolution

**Assessment Date**: November 18, 2026  
**Auditor**: Antigravity Technical Lead & Production Launch Engineering  
**Current Launch Status**: **AMBER (Safe for Option A Interim Storefront Launch; Blocked for Option B Full Commercial Launch)**

---

## 1. Launch Decision Framework (Option A vs. Option B)

To ensure the client can launch urgently without risking compliance violations, payment failures, or brand equity damage, WAAK defines two distinct launch tracks:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ OPTION A: Public Storefront Launch (STATUS: GREEN / READY TO DEPLOY NOW)    │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Public domain live over HTTPS (waak.co.in)                                │
│ • Complete luxury catalog (9 items, 12 photoshoot images, sizes 36–44)      │
│ • WhatsApp Concierge (+91 98217 07031) active for customer sales & inquiries│
│ • Official company details (English Channel Company, GSTIN, Gandhi Nagar)   │
│ • Checkout set to Concierge Booking or Sandbox Test Mode                   │
│ • Shiprocket displays transparent staging simulation disclaimers            │
│ • ZERO dependency on external payment KYC or carrier API passwords         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ OPTION B: Full E-Commerce Commercial Launch (STATUS: AMBER / PENDING)       │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Everything in Option A PLUS:                                              │
│ • Real-time bank debit/card processing via live Razorpay merchant account   │
│ • Live automated courier booking & docket generation via Shiprocket API     │
│ • Automated AI shopping assistant via regenerated BodhX token               │
│ • Legally ratified commercial shipping rates and insurance terms            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Exhaustive Blocker Inventory for Option B

### Blocker 1: Live Razorpay Merchant Credentials & Bank KYC
- **Category**: Payment Compliance & Financial Operations
- **Current State**: Backend is locked in test sandbox mode (`rzp_test_waak2026demo`). Backend security guard strictly blocks processing real transactions with test credentials.
- **Risk if Launched Blindly**: Customer cards would not be debited, or real payments would fail with merchant verification errors.
- **Shortest Safe Path to Resolve**:
  1. Ankur logs in to [Razorpay Dashboard](https://dashboard.razorpay.com/).
  2. Completes business KYC for `ENGLISH CHANNEL COMPANY` (bank account verification and GSTIN upload).
  3. Generates live API keys (**Settings → API Keys → Generate Live Key**).
  4. Provides `RAZORPAY_KEY_ID` (`rzp_live_...`) and `RAZORPAY_KEY_SECRET` securely.

---

### Blocker 2: Live Shiprocket API Credentials
- **Category**: Logistics & Carrier Automation
- **Current State**: Backend handles serviceability with regional fallback simulation (`isStagingFallback: true`, `isLiveCarrierResponse: false`).
- **Risk if Launched Blindly**: Automated courier dockets cannot be created upon checkout.
- **Shortest Safe Path to Resolve**:
  1. Ankur logs in to [Shiprocket Dashboard](https://app.shiprocket.in/).
  2. Navigates to: **Settings → API → Configure → Add New User / Generate API Credentials**.
  3. Provides `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD`.
  4. Live PIN check immediately activates real-time air dispatch timelines.

---

### Blocker 3: GoDaddy Hosting Plan Verification (VPS vs. Shared Linux)
- **Category**: Infrastructure & Runtime Compatibility
- **Current State**: WAAK requires Node.js 20, PostgreSQL 16, and Redis 7. GoDaddy shared cPanel hosting does NOT support PostgreSQL or Redis.
- **Risk if Launched Blindly**: Attempting to upload to shared hosting will result in an offline backend or broken database connections.
- **Shortest Safe Path to Resolve**:
  1. Ankur grants **Delegate Access** to `vinaychute2506@gmail.com` in GoDaddy.
  2. Engineering inspects the purchased hosting product.
  3. If Shared Hosting was purchased, upgrade to **GoDaddy Linux VPS** or deploy backend on a managed cloud instance while keeping domain DNS at GoDaddy.

---

### Blocker 4: Commercial Delivery Fee & Transit Insurance Decision
- **Category**: Commercial Policy
- **Current State**: Storefront displays *"Standard Atelier Delivery"* without unapproved free shipping promises.
- **Risk if Launched Blindly**: Misalignment between customer expectations and actual shipping costs charged at dispatch.
- **Shortest Safe Path to Resolve**:
  - Ankur confirms: Is standard domestic delivery complimentary on all orders, or is there a fixed delivery fee / order threshold? Is transit insurance included?

---

### Blocker 5: BodhX AI Chat Widget Replacement Token
- **Category**: AI Concierge Integration
- **Current State**: Chat widget is intentionally disabled (`VITE_BODHX_WIDGET_ENABLED=false`) because the earlier token was visible in a shared screenshot.
- **Risk if Launched Blindly**: Compromised widget token or rate exhaustion.
- **Shortest Safe Path to Resolve**:
  1. Ankur regenerates the token in **BodhX Dashboard → Docs & Guides → Install Website Chat Widget**.
  2. Provides updated `data-token` string.
  3. Widget activates seamlessly across the storefront.

---

## 3. Immediate Action Plan

1. **Send Handover & Access Briefing to Ankur** with GitHub credentials (`vinaychute2506-oss` / `vinaychute2506@gmail.com`) and GoDaddy Delegate Access instructions.
2. **Execute Option A Deployment**: Configure the live domain and deploy the complete, tested luxury storefront on `release/waak-production`.
3. **Upgrade to Option B**: Transition into full commercial processing the moment Ankur provides the 3 external credentials (Razorpay, Shiprocket, BodhX).
