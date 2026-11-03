# WAAK E-Commerce — Improvement Roadmap & Implementation Plan

**Date**: November 3, 2026  
**Auditor**: Senior Technical Program Manager & Lead Full-Stack Architect  
**Planning Horizon**: Phase 3.0 through Phase 3.4  
**Governing Rule**: All planned improvements preserve the approved V3.2.1 luxury storefront design.  

---

## 1. Roadmap Overview & Timeline Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Phase 3.0: P0 Immediate Blockers (Sizing, Checkout Sync, Error Handling)     │
│ Estimated Effort: 4–6 Hours                                                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Phase 3.1: P1 Commerce Integration & Catalog Unification                   │
│ Estimated Effort: 6–8 Hours                                                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Phase 3.2: P2 Legal Pages, UI/UX Polish & Accessibility                     │
│ Estimated Effort: 4–6 Hours                                                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Phase 3.3: P3 Production Infrastructure & External Hardening                │
│ Estimated Effort: 8–12 Hours                                                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Phase 3.4: P4 Post-Launch Enhancements (Live Razorpay, Multi-Currency)      │
│ Estimated Effort: Post-Launch Milestone                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase-by-Phase Detailed Action Plan

### Phase 3.0 — Critical Bug Fixes & Checkout Blocker Resolution (P0 / Immediate)

#### Item 3.0.1: Unify Sizing Model on Product Detail Page (BUG-01)
- **Description**: Replace hardcoded Western letter sizes (`S`, `M`, `L`, `XL`, `XXL`) in `src/ProductDetail.tsx` with authentic Indian menswear occasionwear chest sizes (`'38'`, `'40'`, `'42'`, `'44'`) with default set to `'40'`.
- **Effort**: 1 Hour
- **Dependencies**: None
- **Regression Risk**: Very Low (Aligns frontend with existing backend validation).
- **Implementation Approach**: Update `SIZES` array in `ProductDetail.tsx` and ensure `AddToCart` sends the selected chest size string.

#### Item 3.0.2: Eliminate Silent Error Swallowing in Checkout Modal (BUG-03)
- **Description**: Remove `.catch(() => {})` in `src/components/CheckoutModal.tsx:78`. Catch backend rejection messages and render a luxury gold-accented error banner inside the modal.
- **Effort**: 1 Hour
- **Dependencies**: Item 3.0.1
- **Regression Risk**: Very Low
- **Implementation Approach**: Use structured try/catch blocks; extract `error.response?.data?.message || 'Bespoke piece unavailable in selected specification'`.

#### Item 3.0.3: Harmonize Catalog IDs & Authentic Pricing (BUG-02)
- **Description**: Synchronize `src/data/products.ts` with PostgreSQL relational IDs (`waak-01`, `waak-02`, etc.) and real luxury couture prices (`₹49,500`, `₹78,000`, etc.), eliminating brittle substring heuristics in `CheckoutModal.tsx`.
- **Effort**: 2 Hours
- **Dependencies**: None
- **Regression Risk**: Low
- **Implementation Approach**: Align mock JSON identifiers with `backend/src/db/seed.ts` product records.

---

### Phase 3.1 — Commerce Integration & Catalog Unification (P1)

#### Item 3.1.1: Live Catalog API Integration
- **Description**: Update storefront home and product views to dynamically fetch products from `api.products.list()` with fallback to local cached JSON if API is unreachable.
- **Effort**: 3 Hours
- **Dependencies**: Phase 3.0
- **Regression Risk**: Low

#### Item 3.1.2: Bespoke Size Guide & Measurement Assistant
- **Description**: Add an interactive modal launched from the PDP ("Size Guide") detailing chest, shoulder, waist, and length measurements in both inches and centimeters for occasionwear.
- **Effort**: 2 Hours
- **Dependencies**: Item 3.0.1
- **Regression Risk**: None (Additive feature)

#### Item 3.1.3: Indian Postal PIN Code Validation (ISSUE-01)
- **Description**: Add client-side regex validation (`^\d{6}$`) with auto-completion or city/state derivation in `CheckoutModal.tsx`.
- **Effort**: 1 Hour
- **Dependencies**: None
- **Regression Risk**: Very Low

---

### Phase 3.2 — UI/UX Refinement, Missing Pages & Accessibility (P2)

#### Item 3.2.1: Legal & Information Modals / Pages (GAP-01)
- **Description**: Implement dedicated modal dialogs or lightweight routes for *"Privacy Policy"*, *"Terms of Service"*, *"Atelier Location"*, and *"Care & Preservation"*.
- **Effort**: 3 Hours
- **Dependencies**: None
- **Regression Risk**: None (Additive feature)

#### Item 3.2.2: Backend Newsletter Subscription Endpoint (GAP-02)
- **Description**: Implement `POST /store/newsletter/subscribe` in Express backend; store emails in PostgreSQL with duplicate protection and return success toast in footer.
- **Effort**: 1.5 Hours
- **Dependencies**: None
- **Regression Risk**: None

#### Item 3.2.3: WCAG Accessibility & Focus Polish (ISSUE-02)
- **Description**: Add `focus-visible:ring-2 focus-visible:ring-[#D4AF37]` on size pill selectors and icon buttons. Shift secondary muted text to `#A3A3A3` for enhanced contrast.
- **Effort**: 1.5 Hours
- **Dependencies**: None
- **Regression Risk**: Very Low

---

### Phase 3.3 — Production Infrastructure & External Hardening (P3)

#### Item 3.3.1: Local Asset Bundling & Caching (BUG-04)
- **Description**: Download and bundle optimized WebP / AVIF thumbnails for all catalog items in `public/images/products/`, removing external Unsplash CDN reliance.
- **Effort**: 2 Hours
- **Dependencies**: None
- **Regression Risk**: Low

#### Item 3.3.2: Staging Domain DNS & HTTPS Setup (EXT-01 & EXT-02)
- **Description**: Provision DNS A records for `staging.waak.in` and configure Let's Encrypt automated TLS certificate issuance in Nginx container.
- **Effort**: 4 Hours
- **Dependencies**: Server hosting access & domain credentials
- **Regression Risk**: None to codebase

#### Item 3.3.3: Automated Customer Notification Dispatch (GAP-03)
- **Description**: Integrate an email transport service (SendGrid, AWS SES) to dispatch order confirmation and status update emails to customers.
- **Effort**: 4 Hours
- **Dependencies**: Email service credentials
- **Regression Risk**: Low

---

### Phase 3.4 — Post-Launch Enhancements (P4)

#### Item 3.4.1: Razorpay Live Merchant Activation (EXT-03)
- **Description**: Transition from sandbox credentials (`rzp_test_...`) to live merchant credentials (`rzp_live_...`) upon completion of business KYC.
- **Effort**: 2 Hours
- **Dependencies**: Merchant banking approval
- **Regression Risk**: Critical (requires live penny-testing)

#### Item 3.4.2: International Multi-Currency & NRI Checkout
- **Description**: Add automatic currency conversion for overseas clientele (USD, GBP, AED, EUR) with Stripe / Razorpay International support.
- **Effort**: Major (Post-Launch)
