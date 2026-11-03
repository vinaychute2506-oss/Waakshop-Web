# WAAK — Phase 3.5: Blockers & Recommendations Matrix

**Target**: WAAK Executive Team, Engineering Leads, and Product Management  
**Auditor**: Antigravity Full-Stack & Systems Architecture  
**Date**: November 3, 2026  
**Scope**: Risk Classification and Actionable Remediation Roadmap for Production Launch  

---

## 1. Classification Methodology

Findings are categorized according to industry-standard severity criteria:

* **P0 — Critical Blocker**: Severe security vulnerability, data loss, financial loss, or catastrophic transactional bug. Blocks all staging pilots and production.
* **P1 — Launch Blocker**: Legal non-compliance, statutory violation, unapproved commercial promise, or absence of live payment/courier integration. Permitted in staging pilots under explicit disclaimers; strictly blocks public commercial launch.
* **P2 — Important Operational**: Operational friction, reliance on mock notifications, or lack of automated reverse logistics. Recommended prior to scaling commercial volume.
* **P3 — Enhancement**: Non-blocking UX polish, micro-animations, analytics instrumentation, or performance enhancements.

---

## 2. Classified Findings & Remediation Roadmap

### P0 — Critical Blockers (Current Count: 0 Active, 4 Remediated)

| ID | Issue & Description | Evidence & History | Resolution Status |
| :-: | :--- | :--- | :---: |
| **P0-1** | **Unauthenticated Cross-Customer Cart Modification** | In Phase 2.1, customer tokens could modify line items in carts belonging to other users. | **REMEDIATED** in Phase 2.2. Enforces customer ID ownership check in `cart.ts` (`HTTP 403 Forbidden`). Verified by 4 automated assertions. |
| **P0-2** | **Unsigned Razorpay Webhooks** | In Phase 2.1, webhook payloads could be replayed without cryptographic signature verification. | **REMEDIATED** in Phase 2.2. Recomputes HMAC-SHA256 signature and rejects unverified payloads with HTTP 400. |
| **P0-3** | **Client-Side Authoritative Pricing Flaw** | In early phase prototypes, client-submitted prices could be submitted during checkout. | **REMEDIATED** in Phase 3.0. Backend derives 100% of line item unit prices and totals from PostgreSQL `products` table. |
| **P0-4** | **Unsafe Fallback JWT & Webhook Secrets** | Backend accepted default or short fallback secrets. | **REMEDIATED** in Phase 2.2. Server fails fast at startup if secret length is less than 32 characters. |

*Currently, **zero P0 Critical Blockers** remain active in the codebase.*

---

### P1 — Launch Blockers (Mandatory Prior to Public Commercial Launch)

#### P1-1: Statutory Corporate Disclosures & Legal Identity (E-Commerce Rules 2020)
* **Severity**: **P1 — Launch Blocker**
* **Finding**: The legal policies (`/terms-and-conditions`, `/privacy-policy`) currently contain bracketed draft placeholders for mandatory Indian statutory identifiers:
  - Corporate Identification Number: `[U18101DL2026PTC000000 - Draft]`
  - Goods & Services Tax Identification Number: `[07AAAAA0000A1Z5 - Draft]`
  - Grievance Redressal Officer: `[Grievance Officer Name - To be designated]`
* **Reproduction**: Navigate to `/terms-and-conditions` or `/privacy-policy`.
* **Impact**: Under Section 4(4) and Section 5 of the Consumer Protection (E-Commerce) Rules, 2020, every e-commerce entity operating in India must conspicuously display its legal registered name, physical address, customer care number, GSTIN, and the contact details of a designated Grievance Officer. Operating without these details invites regulatory penalties.
* **Mitigation**: Legal counsel must supply approved corporate credentials and Grievance Officer details. Replace draft placeholders in `src/components/PolicyView.tsx`.

#### P1-2: Executive Sign-Off on Commercial Return & Shipping Promises
* **Severity**: **P1 — Launch Blocker**
* **Finding**: Product detail accordions and policy pages advertise complimentary express delivery across India (2-4 business days), full transit insurance, and a 7-day exchange window. In Phase 3.5, these claims have been qualified as *"Unapproved Draft Policy (Pending Corporate Confirmation)"*.
* **Reproduction**: View `src/ProductDetail.tsx` (Shipping Accordion and FAQ Item 5) and `src/components/PolicyView.tsx`.
* **Impact**: If launched publicly without signed executive approval, customers can legally demand free 2-4 day delivery and 7-day exchanges even if actual operational margins or bespoke garment lead times cannot support them.
* **Mitigation**: Executive leadership must formally approve the commercial terms. If exchanges are restricted for custom/made-to-order pieces, update the policy to explicitly exempt tailored garments prior to live activation.

#### P1-3: Courier Partner API Integration & Real PIN Serviceability
* **Severity**: **P1 — Launch Blocker**
* **Finding**: The PIN code validator currently performs syntax format checking (verifying 6 numeric digits, `/^[1-9][0-9]{5}$/`). It does not verify real-time courier pickup or delivery availability via carrier APIs (e.g. Delhivery, BlueDart, or Shiprocket).
* **Reproduction**: Enter PIN code `199999` (non-existent/remote PIN with 6 digits); the system reports it as serviceable.
* **Impact**: Orders may be accepted and paid for in regions where courier partners cannot deliver, leading to payment cancellation, customer dissatisfaction, and refund processing costs.
* **Mitigation**: Integrate an asynchronous shipping serviceability API (e.g. Shiprocket `GET /open/courier/serviceability`) in `backend/src/routes/cart.ts` to validate actual courier coverage before accepting checkout.

#### P1-4: Razorpay Live Merchant Key Onboarding
* **Severity**: **P1 — Launch Blocker**
* **Finding**: The backend is configured with sandbox keys (`rzp_test_waak2026demo`) and locked in `isTestPaymentMode: true`.
* **Reproduction**: Check `GET http://localhost:9000/health` → `isTestPaymentMode: true`.
* **Impact**: Real payments cannot be processed; mock payments do not deposit funds.
* **Mitigation**: Complete Razorpay KYC onboarding, configure live API keys and webhook secret in container environment variables, and switch `ALLOW_MOCK_PAYMENTS=false`.

---

### P2 — Important Operational Improvements

#### P2-1: Transactional Email & Notification Gateway
* **Severity**: **P2 — Important Operational**
* **Finding**: Newsletter subscriptions and order confirmations are recorded in PostgreSQL, but no live outbound email service (SendGrid, AWS SES, Resend) is connected.
* **Reproduction**: Subscribe via footer newsletter or place an order; no confirmation email is dispatched to the user's inbox.
* **Impact**: High customer support volume inquiring about order status; non-compliance with customer expectation of immediate digital invoice receipt.
* **Mitigation**: Implement an email worker (e.g. BullMQ or Node-mailer with AWS SES) to dispatch branded HTML confirmation receipts upon `order.paid` events.

#### P2-2: Git History Secret Scrubbing
* **Severity**: **P2 — Important Operational**
* **Finding**: In Phase 2.2, `backend/.env` was unindexed from Git. However, historical commits created in earlier development branches may contain local passwords or test secrets.
* **Reproduction**: Run `git log -p backend/.env` across historical commits.
* **Impact**: If the repository is published as open source or shared with external agencies, past credentials could be viewed.
* **Mitigation**: DevOps must run `git-filter-repo` or `trufflehog` to scrub historical references before sharing access, and rotate all development secrets.

#### P2-3: Customer Support Channels (Monitored Inbox & Phone Line)
* **Severity**: **P2 — Important Operational**
* **Finding**: The contact coordinates cite `atelier@waak.in` and `+91 98765 43210`. The telephone number is a placeholder, and the email domain requires active MX records and a monitored Zendesk/Google Workspace inbox.
* **Reproduction**: Inspect `src/components/Footer.tsx`.
* **Impact**: Customers attempting to contact customer support before or after ordering encounter non-responsive channels.
* **Mitigation**: Provision a dedicated luxury customer concierge phone/WhatsApp line and connect `atelier@waak.in` to a monitored corporate inbox.

---

### P3 — Future Enhancements (Post-Launch Backlog)

#### P3-1: Real-Time Shipment Tracking Webhooks
* **Severity**: **P3 — Enhancement**
* **Description**: Implement inbound webhooks from courier partners (e.g. `out_for_delivery`, `delivered`) to automatically update order fulfillment statuses in PostgreSQL and display live tracking timelines to the customer.

#### P3-2: Image Asset CDN Optimization & WebP Delivery
* **Severity**: **P3 — Enhancement**
* **Description**: While static assets are cached with immutable headers, moving high-resolution occasionwear photography to Cloudflare Images or AWS CloudFront with automated AVIF/WebP transcoding will reduce mobile page load times.

#### P3-3: Wishlist Merging Across Anonymous and Authenticated Sessions
* **Severity**: **P3 — Enhancement**
* **Description**: Automatically merge items saved in localStorage wishlists into the customer's PostgreSQL wishlist upon user login.

---

## 3. Summary Action Plan

```
┌─────────────────────────────────────────────────────────────┐
│                 CURRENT PHASE 3.5 STATUS                    │
│           READY FOR A CONTROLLED STAGING PILOT              │
│       (316 / 316 Passing Automated Test Assertions)         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            GATED ACTIONS FOR COMMERCIAL LAUNCH              │
│                                                             │
│  1. Business sign-off on 7-day exchange & express shipping  │
│  2. Legal insertion of real CIN, GSTIN, & Grievance Officer │
│  3. Logistics API integration (Delhivery/Shiprocket)        │
│  4. Razorpay live merchant credentials onboarding           │
│  5. Dedicated support email (atelier@waak.in) & phone line  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 PHASE 4.0: PRODUCTION GO-LIVE               │
└─────────────────────────────────────────────────────────────┘
```
