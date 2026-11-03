# WAAK Phase 3.4 — Policy Content & Claims Review
**Phase:** 3.4 — Policy Content Audit & Verification Standards  
**Status:** DRAFT FOR CORPORATE, BUSINESS & LEGAL COUNSEL REVIEW  
**Date:** November 3, 2026  

---

## 1. Objective of Policy Audit

In e-commerce platforms selling high-value luxury goods (such as bespoke occasionwear priced at ₹24,500 – ₹54,500+), brand credibility relies on radical honesty. Statements regarding return windows, fabric composition, delivery transit times, and logistics coverage must not confuse marketing aspirations with contractual commitments.

This review classifies all customer-facing policy claims into three distinct categories:
1. **Technically Verified Mechanisms**: Implemented, tested, and enforced in software.
2. **Draft Commercial Terms**: Reasonable business propositions awaiting executive sign-off.
3. **Pending Corporate & Partner Details**: Items requiring formal legal entity registration, courier API contracts, or telecom provisioning.

---

## 2. Policy Claims Audit Matrix

| Policy Area | User-Facing Statement | Current Status | Technical Implementation | Action Required from Business/Legal |
| :--- | :--- | :--- | :--- | :--- |
| **Returns & Exchanges** | "Seven (7) calendar days exchange & alteration window" | **Draft Commercial Proposal** | Software allows order lookup; return initiation requires manual concierge ticket | Confirm whether 7 calendar days or 7 business days from courier delivery; confirm if store credit only or partial refund. |
| **Custom Garments** | "Made-to-order & altered ensembles are non-refundable; complimentary alteration provided" | **Draft Commercial Proposal** | Disclaimers present in `PolicyView.tsx` | Confirm alteration turnaround SLA (e.g. 7-10 days) and shipping cost allocation for alterations. |
| **PIN Code Delivery** | "Delivery availability checked via postal PIN" | **Technically Verified (Format Only)** | Strict 6-digit regex (`/^\d{6}$/`) validates format; does NOT check real-time courier serviceability | Integrate real-time courier serviceability API (e.g. Shiprocket, Blue Dart, Delhivery) in Phase 4. |
| **Shipping Timelines** | "Ready-to-wear: 2–4 days; Bespoke: 10–14 days" | **Draft Commercial Estimate** | Displayed in shipping tables in `PolicyView.tsx` | Review artisan loom capacity and seasonal festive peak workloads to ensure realistic commitments. |
| **Transit Insurance** | "Insured shipping across India" | **Draft Commercial Term** | Mentioned in product copy and policies | Confirm marine/transit cargo insurance policy with corporate underwriter. |
| **Fabric Composition** | "Pure Silk, Banarasi Brocade, Zardozi Handwork" | **Merchandising Claim** | Merchandised in static catalog data | Verify that material composition labels comply with Indian Textile Labelling Regulations (Care labelling, Silk Mark certification). |
| **Atelier Coordinates** | "Mehrauli Heritage Couture District, New Delhi, 110030" | **Placeholder** | Declared with notice "(Salon viewings strictly by prior appointment)" | Replace with verified registered commercial lease address. |
| **Telephonic Contact** | "WhatsApp / Concierge Telephone Line" | **Placeholder** | Declared as "Dedicated line allocation pending commercial carrier provisioning" | Secure enterprise WhatsApp Business API number and assign concierge staff. |
| **Statutory Corporate Info** | GSTIN / CIN / Corporate Entity Name | **Placeholder** | Explicitly stated as pending corporate registration in policy draft | Provide valid GSTIN and registered company name for checkout invoices. |

---

## 3. Disclaimers Implemented in Frontend

To protect the business and set accurate client expectations prior to legal finalization, every policy page rendered via `PolicyView.tsx` features an explicit review alert:

> ◈ **Legal & Business Review Status:** This document represents the [Policy Title] draft prepared for technical compliance and client review. Commercial terms, partner logistics service-level agreements, and statutory corporate details are subject to formal confirmation prior to commercial activation.

Furthermore, on the Shipping Policy page:
> **Format vs. Real-Time Serviceability:** The storefront PIN tool verifies that the entered postal code satisfies the official 6-digit Indian Postal Code specification. Actual courier serviceability and express transit windows are determined during checkout against active logistics carrier coverage tables.
