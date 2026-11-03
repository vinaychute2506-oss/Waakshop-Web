# WAAK Phase 3.4 — Regression Test Report
**Phase:** 3.4 — Legal Pages, Footer Functionality, Newsletter Persistence & Policy Audit  
**Date:** November 3, 2026  
**Environment:** Development & Staging (`node v24.14.1`, PostgreSQL 16, Redis 7, Nginx)  
**Total Assertions Verified:** 296 passed across 6 test suites  
**Failed Assertions:** 0  
**TypeScript Build Status:** 0 errors (Frontend & Backend)

---

## 1. Test Suite Execution Summary

| Test Suite | Path | Target | Assertions | Status |
| :--- | :--- | :--- | :---: | :---: |
| Phase 3.4 Newsletter & Policy Suite | `scratch/test-phase-3-4-policy-newsletter.mjs` | Port 9000 & 5173 | 70 / 70 | **PASS** |
| Phase 3.3 Product Detail Page Suite | `scratch/test-phase-3-3-pdp.mjs` | Port 9000 | 54 / 54 | **PASS** |
| Phase 3.1 Dynamic Catalog & PIN Suite | `scratch/test-phase-3-1-e2e.mjs` | Port 9000 | 49 / 49 | **PASS** |
| Phase 3.0 Commerce E2E Suite | `scratch/test-phase-3-0-e2e.mjs` | Port 9000 | 34 / 34 | **PASS** |
| Backend Security & Integrity Suite | `backend/test-backend.js` | Port 9000 | 40 / 40 | **PASS** |
| Phase 2.3 Staging Acceptance Suite | `backend/test-staging.js` | Port 9001 & 8088 | 49 / 49 | **PASS** |
| **Total Cumulative Assertions** | | | **296 / 296** | **PASS (100%)** |

---

## 2. Phase 3.4 Breakdown (70 Assertions)

### Group 1: Newsletter API & Persistence Verification (30 Assertions)
- `POST /store/newsletter` accepts valid subscription and responds HTTP 201 Created.
- Normalized email persisted in PostgreSQL `newsletter_subscribers` table with lowercase conversion and whitespace trimming.
- Database records source attribution (`footer_test`), default status (`subscribed`), consent flag (`true`), and `created_at` timestamp.
- Duplicate subscription returns HTTP 200 OK with `duplicate: true` flag and informative message.
- Database enforces `UNIQUE(email)` constraint without record duplication.
- Invalid email formats rejected with HTTP 400 (empty string, whitespace, missing domain, missing username, double consecutive dots `..`, non-FQDN).
- Missing payload `{}` rejected with HTTP 400.
- Oversized payload (> 255 chars) rejected with HTTP 400.
- IP rate limiter enforces max threshold, responding HTTP 429 Too Many Requests with informative retry error.

### Group 2: Frontend Policy Routes & Navigation Integrity (18 Assertions)
- Direct HTTP navigation to `/privacy-policy` returns HTTP 200 with HTML shell and Vite mount.
- Direct HTTP navigation to `/terms-of-service` returns HTTP 200 with HTML shell and Vite mount.
- Direct HTTP navigation to `/shipping-policy` returns HTTP 200 with HTML shell and Vite mount.
- Direct HTTP navigation to `/returns-and-exchanges` returns HTTP 200 with HTML shell and Vite mount.
- Direct HTTP navigation to `/care-and-preservation` returns HTTP 200 with HTML shell and Vite mount.
- Direct HTTP navigation to `/contact` returns HTTP 200 with HTML shell and Vite mount.

### Group 3: Policy Content Review & Verification Standards (20 Assertions)
- `PolicyView.tsx` renders prominent "Legal & Business Review Status" banner on all policy routes.
- Draft status explicitly declared for corporate legal confirmation.
- Shipping policy clearly articulates 6-digit PIN format validation vs. real-time logistics carrier serviceability.
- 7-day exchange window articulated with conditions distinguishing standard sizing vs. bespoke/altered ensembles.
- Dedicated communication channels defined (`privacy@waak.co.in`, `concierge@waak.co.in`, `orders@waak.co.in`, `press@waak.co.in`).
- Honest disclaimer that physical WhatsApp and phone lines are pending carrier allocation.
- Footer connects directly to backend `api.newsletter.subscribe()`.
- Footer handles loading, success, duplicate, and error states with accessible screen-reader tags (`role="status"`, `role="alert"`).
- All 6 footer links navigate via semantic `<button>` elements with keyboard focus support.
- `AppContext.tsx` resolves deep policy URLs on initial page load and window popstate events.
- `App.tsx` dynamically mounts `PolicyView` for all policy routes.

### Group 4: Courier Serviceability Interface Readiness (2 Assertions)
- Strict 6-digit regex (`/^\d{6}$/`) maintained for postal code format verification.
- User feedback accurately specifies format validation while noting docket carrier confirmation.

---

## 3. Production Build Verification

### Backend Build:
```bash
npm --prefix backend run build
# Result: Exit 0. TypeScript compilation succeeded. Migrations and schema copied cleanly.
```

### Frontend Build:
```bash
npm run build
# Result: Exit 0. TypeScript compilation succeeded. Vite build completed in 2.95s.
# Output bundle: 400.53 kB JS (108.21 kB gzip), 33.38 kB CSS (7.06 kB gzip).
```
