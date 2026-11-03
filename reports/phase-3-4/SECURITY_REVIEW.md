# WAAK Phase 3.4 — Security & Integrity Review
**Phase:** 3.4 — Legal Pages, Footer Functionality, Newsletter Persistence & Policy Audit  
**Date:** November 3, 2026  
**Auditor:** Senior Security Engineer & QA Lead  
**Scope:** Express API routes, PostgreSQL schema migrations, React client service layer, rate limiting, and input handling  

---

## 1. Threat Modeling & Vulnerability Assessment

| Potential Threat | Severity | Mitigation Implemented | Verification Result |
| :--- | :---: | :--- | :--- |
| **Email Bombing / Newsletter Spam** | Medium | Dedicated `newsletterRateLimiter` restricts requests to 30 per 10-minute window per IP. | Verified via test suite; attempts beyond threshold return HTTP 429. |
| **SQL Injection via Email or Source** | Critical | Parameterized queries (`$1`, `$2`, `$3`) throughout all database operations. | Verified; malformed payloads and symbols safely escaped by PostgreSQL client. |
| **Cross-Site Scripting (XSS) via Feedback** | High | React DOM sanitization escapes user input in status and alert messages; input truncated to 255 chars. | Verified; HTML tags in input strings are rendered as inert text. |
| **Denial of Service via Payload Bloat** | Medium | `express.json({ limit: '1mb' })` and explicit 255-character email length checks reject oversized bodies. | Verified; 261-character payload rejected with HTTP 400. |
| **Unauthenticated Cross-Customer Access** | High | Order and cart routes maintain strict session token validation and owner checks (`customer_id` / `session_id`). | Verified; all cross-customer cart/order tests in regression suite pass. |
| **Staging Environment Exposure** | High | Staging environment enforces HSTS, strict security headers (`nosniff`, `SAMEORIGIN`), and sandbox payment lock. | Verified; 49/49 staging tests pass. |

---

## 2. Secrets & Credential Audit

- **Environment Separation**: No production secrets or live Razorpay credentials are committed to Git.
- **Git State**: Development and staging configurations utilize isolated test sandbox credentials (`rzp_test_waak2026demo` / `waakSecretRazorpayKey2026`).
- **Payment Verification**: Cryptographic HMAC-SHA256 signature verification protects order captures against client tampering.

---

## 3. Privacy & Compliance Readiness

- **Consent Recording**: `newsletter_subscribers` explicitly stores `consent_recorded = true` alongside timestamp and subscription source.
- **Data Minimization**: Newsletter persistence records strictly the email and source attribution; no unneeded telemetry or patron identifiers are stored.
- **Patron Rights**: `PolicyView.tsx` declares patrons' rights to inspect, update, or request erasure of measurement and account profiles via `privacy@waak.co.in`.
