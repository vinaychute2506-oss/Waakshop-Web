# WAAK Phase 3.0 — Remaining Issues & Deferred Scope Register

**Date**: November 3, 2026  
**Auditor**: Antigravity Full-Stack Architect  
**Branch**: `feature/phase3-commerce-blockers`  
**Status**: Phase 3.0 (P0 Immediate Commerce Blockers) Complete; Subsequent Improvements Categorized  

---

## 1. Resolved Issues in Phase 3.0

| Issue ID | Severity | Category | Status in Phase 3.0 |
| :--- | :--- | :--- | :--- |
| **BUG-01** | **High** | Sizing Discrepancy | **RESOLVED**: Replaced Western letter sizes with authoritative Indian chest sizes (`38`, `40`, `42`, `44`). Added live stock validation, disabled sold-out variants, and created an interactive Bespoke Size Guide modal. |
| **BUG-02** | **High** | Catalog ID & Price Discrepancy | **RESOLVED**: Unified product IDs (`waak-01`..`waak-04`) and synchronized luxury pricing (`₹49,500`, `₹54,500`, `₹38,500`, `₹24,500`) between frontend catalog and PostgreSQL database. |
| **BUG-03** | **Medium** | Checkout Error Swallowing | **RESOLVED**: Removed `.catch(() => {})`, added pre-flight validation, and surfaced actionable, luxury-styled error alerts on line-item reservation failures. |

---

## 2. Deferred Scope for Subsequent Phases (P1 to P4)

The following items were identified in the Complete Website QA Audit and deferred to subsequent phases as per the governing instructions:

### 2.1 Phase 3.1 — Commerce Integration & Catalog Unification (P1)
- **Catalog Dynamic API Fetching**: Connect homepage and collection filters directly to `api.products.list()` with fallback caching.
- **Client-Side PIN Code Validation (ISSUE-01)**: Add strict 6-digit regex validation (`^\d{6}$`) with automated city/state derivation in `CheckoutModal.tsx`.

### 2.2 Phase 3.2 — UI/UX Refinement, Missing Pages & Accessibility (P2)
- **Footer Legal & Informational Modals (GAP-01)**:
  - Create dedicated modal dialogues or lightweight subpages for:
    - *"Privacy Policy"*
    - *"Terms of Service"*
    - *"Atelier Location & Private Appointments"*
    - *"Garment Care & Preservation"*
- **Newsletter Subscription API (GAP-02)**:
  - Implement `POST /store/newsletter/subscribe` in Express backend storing subscriber emails in PostgreSQL with duplicate deduplication.
- **WCAG Accessibility & Focus Polish (ISSUE-02)**:
  - Add explicit `focus-visible:ring-2 focus-visible:ring-[#D4AF37]` on size pill selectors and icon buttons.
  - Adjust secondary muted text contrast ratio to meet WCAG AA standards.

### 2.3 Phase 3.3 — Production Infrastructure & External Hardening (P3)
- **Local Asset Bundling (BUG-04)**:
  - Download and bundle optimized local WebP/AVIF images in `public/images/products/`, removing external Unsplash CDN dependencies.
- **Public Staging HTTPS & DNS (EXT-01 & EXT-02)**:
  - Provision public DNS A records for `staging.waak.in` and configure automated Let's Encrypt TLS reverse proxy in Nginx.
- **Transactional Customer Notifications (GAP-03)**:
  - Connect asynchronous message queue with an email transport (SendGrid/SES) to dispatch automated order confirmation and status update emails.

### 2.4 Phase 3.4 — Post-Launch Enhancements (P4)
- **Razorpay Live Merchant Activation (EXT-03)**:
  - Switch from sandbox test keys (`rzp_test_...`) to live merchant credentials (`rzp_live_...`) upon completion of business KYC.
- **International Multi-Currency**:
  - Support automatic currency conversion (USD, GBP, AED, EUR) for NRI and global clients.
