# WAAK Trust Copy Approval Matrix & Claims Classification
## Classification of Technical Controls, Commercial Promises, and Prohibited Statements

**Project:** WAAK Atelier E-Commerce Web Storefront  
**Phase:** Client Requirements Remediation — Step 3  
**Status:** Staging Review Draft  
**Audit Date:** November 4, 2026  

---

### 1. Matrix Overview

To maintain legal integrity, avoid consumer deception under Indian consumer protection regulations, and prevent fraudulent marketing claims, all customer-facing trust copy has been audited and classified into four distinct categories:

1. **Category A — Verified Technical Controls**: Capabilities implemented, tested, and cryptographically enforced in the current codebase.
2. **Category B — Third-Party Delegation Boundaries**: Security provided directly by third-party infrastructure (Razorpay) rather than WAAK servers.
3. **Category C — Business Policies Awaiting Authorization**: Commercial promises requiring business owner sign-off and legal terms approval before commitment.
4. **Category D — Prohibited & Exaggerated Claims**: Statements that are legally dubious, technically false, or strictly forbidden from the codebase.

---

### 2. Trust Copy Classification Matrix

| Statement / Claim | Classification | Technical / Legal Reality | Current Status in Codebase |
| :--- | :--- | :--- | :--- |
| **"Server-Verified Pricing: Order totals and items are verified server-side prior to payment initiation"** | **Category A** (Verified Control) | Implemented in `backend/src/routes/store/orders.ts`. Backend recalculates item prices from PostgreSQL, validates discount codes, and sets total. | **APPROVED & DISPLAYED** in Checkout Modal |
| **"HMAC Signature Verification: Payments authenticated via cryptographic Razorpay webhook signatures"** | **Category A** (Verified Control) | Implemented in `backend/src/routes/store/payment.ts`. Verifies Razorpay HMAC-SHA256 signatures before marking orders paid. | **APPROVED & DISPLAYED** in Checkout Modal |
| **"Atomic Variant Stock Reservation: Variant stock decremented atomically upon confirmed payment"** | **Category A** (Verified Control) | Implemented in PostgreSQL `product_variants` table via atomic transaction decrement queries. | **APPROVED & DISPLAYED** on Product Detail Page |
| **"Zero Cardholder Data Retention: Sensitive card numbers, CVVs, and banking details are never stored on WAAK servers"** | **Category B** (Delegation Boundary) | Card and banking credentials are submitted directly into Razorpay's PCI-DSS compliant client SDK; WAAK servers only receive payment IDs. | **APPROVED & DISPLAYED** in Checkout Modal |
| **"Staging Sandbox: Active in Test Mode (rzp_test_*). No real monetary charges will occur"** | **Category A** (Verified Control) | Runtime safety guard `payment_guard.ts` locks keys to `rzp_test_waak2026demo`. Prevents accidental production transactions. | **APPROVED & DISPLAYED** on Submit Button & Card |
| **"Bespoke Sizing & Alteration: Complimentary sizing consultation and fitting adjustments"** | **Category C** (Business Policy) | WAAK atelier can provide alteration services, but exact turnaround time and return windows are unfinalized. | **DISPLAYED WITH "Draft Policy" BADGE** |
| **"Complimentary Express Dispatch: Insured, temperature-controlled courier delivery across India"** | **Category C** (Business Policy) | Logistics contracts and courier SLAs are pending business owner sign-off. | **DISPLAYED WITH "Draft Policy" BADGE** |
| **"Official WhatsApp Concierge Assistance"** | **Category C** (Business Policy) | Codebase is fully prepared (`WhatsAppInquiryButton.tsx`), but business phone number is not yet provided by the client. | **CONFIGURATION GATED (Renders NULL until number set)** |
| **"PCI-DSS Level 1 Certified Atelier"** | **Category D** (Prohibited Claim) | WAAK servers are not individually audited for PCI-DSS Level 1. Razorpay holds the certification, not WAAK. | **STRICTLY PROHIBITED (Verified absent in tests)** |
| **"100% Fraud-Proof & Immune to Cyberattacks"** | **Category D** (Prohibited Claim) | No system can guarantee 100% fraud immunity; making this claim exposes the company to legal liability. | **STRICTLY PROHIBITED (Verified absent in tests)** |
| **"ISO 27001 Certified Luxury House"** | **Category D** (Prohibited Claim) | WAAK has not undergone an ISO/IEC 27001 audit. | **STRICTLY PROHIBITED (Verified absent in tests)** |
| **"Unconditional 30-Day Money-Back Guarantee, No Questions Asked"** | **Category D** (Prohibited Claim) | Luxury couture items made-to-order cannot support unrestricted return policies without severe operational damage. | **STRICTLY PROHIBITED (Verified absent in tests)** |
| **"Guaranteed 24-Hour Delivery Nationwide"** | **Category D** (Prohibited Claim) | Physically unfeasible for bespoke handcrafted occasionwear. | **STRICTLY PROHIBITED (Verified absent in tests)** |

---

### 3. Action Items for Business Leadership

To advance Category C items into fully approved production claims, the following decisions are required from the client:
1. **WhatsApp Business Number**: Supply the registered WhatsApp Business phone number (e.g. `+91 98XXX XXXXX`) to configure `VITE_WHATSAPP_NUMBER`.
2. **Exchange Policy Approval**: Review and formalize `/returns-and-exchanges` regarding allowed exchange windows (e.g. 7 days vs 14 days) and condition of tags/labels.
3. **Shipping SLA Approval**: Review and formalize `/shipping-policy` regarding standard transit time (e.g. 5–7 business days).
