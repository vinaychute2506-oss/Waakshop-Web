# WAAK — Phase 3.5: Business Approval & Commercial Claims Matrix

**Report Target**: WAAK Executive Leadership, Commercial Directors, and Legal Counsel  
**Auditor**: Antigravity Technical & Compliance Engineering  
**Date**: November 3, 2026  
**Status**: Formal Audit of Customer-Facing Claims and Commitments  

---

## 1. Overview & Regulatory Rationale

Under the **Consumer Protection (E-Commerce) Rules, 2020** and the **Digital Personal Data Protection Act (DPDP Act), 2023**, e-commerce platforms operating in India are legally accountable for representations made regarding shipping timelines, return/exchange rights, corporate identity, country of origin, and fabric specifications.

In Phase 3.5, all customer-facing representations across the storefront, policy pages, checkout flows, and product accordions were inspected and cataloged. Where commercial terms have not yet received formal corporate sign-off, technical safeguards (prominent "Unapproved Draft Policy" banners and disclaimer qualifications) have been introduced to insulate the business during staging pilots.

The matrix below provides the actionable sign-off roadmap required prior to switching payment gateways to live production.

---

## 2. Business Approval Matrix

| # | Commercial Claim / Item | Current Wording in Application | Codebase Location | Evidence & Verification Finding | Risk Level | Approval Status | Required Business Action |
| :-: | :--- | :--- | :--- | :--- | :-: | :-: | :--- |
| **1** | **Complimentary Express Delivery & Insured Transit** | *"All domestic orders receive complimentary express courier dispatch with specialized insured transit within 2 to 4 business days of atelier dispatch."* | `src/ProductDetail.tsx` (Shipping Accordion), `src/components/PolicyView.tsx` (`/shipping-and-delivery`) | Hardcoded claim. Delivery is currently unintegrated with logistics APIs (e.g. Delhivery, BlueDart, Shiprocket). Insured transit is subject to carrier SLA contracts. Qualified with draft status banner in Phase 3.5. | **High** (Financial / Consumer Protection) | **UNAPPROVED DRAFT** | Confirm logistics partnership, actual carrier insurance coverage, free shipping margin thresholds, and actual dispatch SLA before commercial launch. |
| **2** | **7-Day Exchange Window & Bespoke Alterations** | *"We offer exchanges within 7 days of delivery for unworn garments in original condition with intact security tags."* | `src/ProductDetail.tsx` (FAQ Item 5), `src/components/PolicyView.tsx` (`/returns-and-exchanges`) | Hardcoded claim. Returns portal is not automated; reverse logistics partner is not contracted. Qualified in Phase 3.5 with disclaimer: *"Draft commercial term subject to final business sign-off prior to commercial activation."* | **High** (Operational / Inventory) | **UNAPPROVED DRAFT** | Executive approval required on exchange window duration, reverse pickup charges, custom sizing non-returnability clauses, and return authorization workflow. |
| **3** | **Statutory Corporate Details (CIN, GSTIN, Grievance Officer)** | *CIN: `[U18101DL2026PTC000000 - Draft]`, GSTIN: `[07AAAAA0000A1Z5 - Draft]`, Grievance Officer: `[Grievance Officer Name - To be designated]`* | `src/components/PolicyView.tsx` (`/terms-and-conditions`, `/privacy-policy`) | Mandatory disclosures under Consumer Protection (E-Commerce) Rules 2020. Placeholders are clearly bracketed and accompanied by draft notice banners. | **Critical** (Statutory / Legal) | **UNAPPROVED DRAFT** | Legal counsel must supply verified corporate entity name, registered CIN, active GSTIN number, physical office address, and designated Grievance Officer email and phone number. |
| **4** | **Atelier Contact Coordinates & Customer Care** | *Support: `atelier@waak.in`, Phone: `+91 98765 43210`, Atelier Address: `Atelier WAAK, Mehrauli, New Delhi 110030`* | `src/components/Footer.tsx`, `src/ProductDetail.tsx`, `src/components/PolicyView.tsx` (`/terms-and-conditions`) | Placeholder telephone number (`+91 98765 43210`) exists. Email `atelier@waak.in` matches admin seed but needs monitored inbox provisioning. | **Medium** (Customer Trust / Support) | **REQUIRES INPUT** | Provision dedicated corporate customer care phone line (or WhatsApp Business number) and activate monitored email inbox for `atelier@waak.in` and `legal@waak.in`. |
| **5** | **Fabric Composition & Handcrafted Provenance** | *`100% Pure Raw Silk`, `Hand-Embroidered Zardozi`, `Pure Tussar Silk`, `Crushed Silk Kurta`, `Micro-velvet base`* | `src/data/products.ts`, `src/ProductDetail.tsx`, `src/components/PolicyView.tsx` (`/care-and-preservation`) | Descriptions in product catalog match luxury occasionwear terminology. Labeling must conform to Ministry of Textiles guidelines and Legal Metrology rules. | **Medium** (Consumer Law / Metrology) | **REQUIRES INPUT** | Merchandising team must verify actual laboratory or mill fabric blend percentages (e.g. 100% pure silk vs silk blend) to prevent mislabeling claims under consumer protection laws. |
| **6** | **Garment Sizing Specifications & Measurement Chart** | Chest sizes `38`, `40`, `42`, `44` mapped to specific Chest, Shoulder, Waist, Length, and Sleeve inches in size modal. | `src/ProductDetail.tsx` (`SIZE_CHART` object), `src/components/SizeGuideModal.tsx` | Measurements represent standard tailored sherwani metrics. Frontend and backend variant IDs are strictly synchronized (`waak-01-38` to `waak-04-44`). | **Low** (Operational / Fits) | **REQUIRES INPUT** | Master cutter / production manager must confirm that physical production patterns match the exact chest, shoulder, and sleeve allowances shown in the modal. |
| **7** | **PIN Code Delivery Validation vs. Serviceability** | *"Serviceable Indian PIN Code: Format verified (6 numeric digits). Dispatch estimate: 2-4 business days."* | `src/ProductDetail.tsx` (PIN Checker), `backend/src/routes/cart.ts` (Address validation) | PIN validation checks strict 6-digit numeric syntax (`/^[1-9][0-9]{5}$/`). PDP UI explicitly informs user that format is verified, not real-time courier pickup/dropoff connectivity. | **Medium** (Customer Expectations) | **APPROVED FOR PILOT** (Requires logistics API before launch) | Connect backend to live logistics partner API (e.g. Shiprocket or Delhivery PIN serviceability endpoint) prior to production launch to block remote unserviceable pincodes. |
| **8** | **Newsletter Subscription & Direct Marketing Consent** | *"By submitting, you consent to receive seasonal atelier invitations. Unsubscribe anytime via our Privacy Policy."* | `src/components/Footer.tsx`, `backend/src/routes/newsletter.ts` (`POST /unsubscribe`) | Automated unsubscription endpoint (`POST /store/newsletter/unsubscribe`) is implemented and tested. Explicit opt-in language satisfies DPDP Act 2023 consent standards. | **Low** (Privacy Compliance) | **APPROVED FOR PILOT** | Marketing team must integrate a real transactional email provider (SendGrid, AWS SES, or Resend) to dispatch actual automated confirmation and unsubscribe links. |
| **9** | **Payment Gateway Mode & Razorpay Credentials** | Sandbox Key ID: `rzp_test_waak2026demo` with `isTestPaymentMode: true` locked in backend health endpoint and payment flow. | `backend/src/routes/cart.ts`, `backend/src/routes/health.ts`, `docker-compose.staging.yml` | Backend strictly enforces sandbox key headers and rejects mock payments if `ALLOW_MOCK_PAYMENTS` is false. Razorpay webhook signature verification enforced. | **High** (Financial Security) | **STAGING APPROVED ONLY** (Live keys forbidden) | Secure live merchant credentials from Razorpay, configure production webhook endpoint with strict HMAC secret, and enforce IP-whitelisting before production go-live. |

---

## 3. Mandatory Sign-Off Protocol Before Live Production

Prior to promoting WAAK from staging pilot to public commercial launch:

1. **Executive Sign-Off**:
   - Signature from Managing Director / CEO on Return & Refund Policy and Delivery Timelines.
2. **Legal Sign-Off**:
   - Review of Terms & Conditions and Privacy Policy by a qualified Indian cyberlaw advocate.
   - Incorporation details (CIN, registered address) and GSTIN inserted into `src/components/PolicyView.tsx`.
3. **Logistics SLA Contract**:
   - Executed courier agreement with designated courier partner (Delhivery, Blue Dart, or Shiprocket) defining transit insurance thresholds and reverse pickup workflows.
4. **Merchandising Quality Certificate**:
   - Fabric composition confirmation sheets signed by the head of production.
