# WAAK Phase 3.4 — Remaining Issues & Roadmap Ahead
**Phase:** 3.4 — Legal Pages, Footer Functionality, Newsletter Persistence & Policy Audit  
**Date:** November 3, 2026  
**Status:** ALL PHASE 3.4 OBJECTIVES COMPLETED  

---

## 1. Phase 3.4 Deliverables Status

All objectives mandated for Phase 3.4 are completed:
- [x] Standalone luxury routes for 6 legal/concierge pages (`/privacy-policy`, `/terms-of-service`, `/shipping-policy`, `/returns-and-exchanges`, `/care-and-preservation`, `/contact`).
- [x] Direct browser reload and popstate navigation preserved in `AppContext.tsx` and `App.tsx`.
- [x] Semantic `<button>` links in `Footer.tsx` with accessible focus styling replacing former static `<span>` elements.
- [x] PostgreSQL migration `003_newsletter_subscribers.sql` applied and tracked in `schema_migrations`.
- [x] Express route `POST /store/newsletter` operational with validation, rate limiting, and duplicate handling.
- [x] Policy content audit conducted with prominent "Legal & Business Review Status" disclaimers on draft commercial terms.
- [x] Strict distinction between 6-digit postal code format checking and real-time courier serviceability.
- [x] All 6 regression test suites passing (296/296 assertions, 0 failures).

---

## 2. Recommended Next Roadmap Items (Phase 4.0 & Beyond)

| Priority | Item | Description | Dependencies |
| :---: | :--- | :--- | :--- |
| **P1** | **Business & Legal Sign-off** | Review the draft policy terms in `reports/phase-3-4/POLICY_CONTENT_REVIEW.md` with client leadership and legal counsel. | Client Executive Team & Legal Counsel |
| **P1** | **Real-Time Logistics Carrier API** | Replace client-side postal format validation with a real-time carrier serviceability API (e.g. Shiprocket, Blue Dart, Delhivery) returning exact dispatch SLAs and serviceable PIN lists. | Logistics Aggregator Commercial Account & API Key |
| **P2** | **Atelier CRM / Email Relay** | Integrate transactional email dispatch (e.g. Resend, SendGrid, Amazon SES) to send automated welcome curations upon newsletter subscription and dispatch tracking updates. | SMTP / API Key Configuration |
| **P2** | **Bespoke Consultation Booking Modal** | Connect "Bespoke Wedding Consultation" on the Contact page to an interactive appointment calendar / date picker allowing brides and grooms to reserve private salon styling slots. | Concierge availability calendar schema |
| **P3** | **Production Live Razorpay Activation** | Switch Razorpay from test mode (`isTestMode = true`) to live production credentials once commercial entity registration, bank account settlement, and business verification are complete. | Merchant KYC Approval & Razorpay Live API Keys |
