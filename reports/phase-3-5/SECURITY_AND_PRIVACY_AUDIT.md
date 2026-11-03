# WAAK — Phase 3.5: Security & Privacy Audit Report

**Audit Target**: WAAK E-Commerce Application & Staging Infrastructure  
**Auditor**: Antigravity Security & Privacy Engineering  
**Date**: November 3, 2026  
**Scope**: Application Security, Cryptographic Verification, Multi-Tenant Data Isolation, Threat Modeling, and DPDP Act Compliance  

---

## 1. Executive Summary

A comprehensive, defense-in-depth security audit was conducted across the frontend, API gateway, database queries, authentication services, payment workflows, and Docker container configurations.

All critical vulnerabilities previously flagged (including unsecured cart access, unsigned webhooks, and default fallback secrets) have been remediated and verified under automated regression tests. The application demonstrates high security resilience suitable for a controlled staging pilot.

---

## 2. Threat Modeling & Vulnerability Assessment

### 2.1 Payment Security & Razorpay Integration
* **Finding**: The payment gateway is strictly locked in **Test Sandbox Mode** (`isTestPaymentMode: true`).
* **Signature Cryptography**: Razorpay checkout payments and asynchronous webhook events are verified using cryptographic `HMAC-SHA256` hashing.
  - The payment verification endpoint (`POST /store/carts/:id/payment/verify`) recomputes `crypto.createHmac('sha256', secret).update(order_id + "|" + payment_id).digest('hex')` and validates against `razorpay_signature` in constant time (`crypto.timingSafeEqual`).
  - Webhook endpoint (`POST /webhooks/razorpay`) rejects requests lacking the `X-Razorpay-Signature` header with HTTP 400 and verifies payload integrity against `RAZORPAY_WEBHOOK_SECRET`.
* **Idempotency Protection**: When duplicate payment verification requests or replayed webhook events arrive, the backend detects prior `"paid"` status in PostgreSQL and safely returns the existing order without duplicate debiting or duplicate stock decrements.
* **Test Isolation**: In staging, `ALLOW_MOCK_PAYMENTS` is enabled for sandbox simulation, but disabled in live production mode.

### 2.2 Customer Authorization & Multi-Tenant Data Isolation
* **Cross-Customer Cart Injection**: All cart mutation endpoints (`POST /store/carts/:id/line-items`, `DELETE /store/carts/:id/line-items/:itemId`) enforce strict customer ownership. If Customer B attempts to modify Customer A's cart using their own JWT token, the server terminates the request with `HTTP 403 Forbidden` (`"Access denied: You do not own this cart"`).
* **Cross-Customer Order Privacy**: Order inspection (`GET /store/orders/:id`) checks `order.customer_id === req.customer.id`. Customer B cannot view Customer A's delivery address, phone number, or purchased items (`HTTP 403 Forbidden`).
* **Admin Privilege Separation**: Routes under `/admin/*` require an admin JWT with `role === 'admin'`. Authenticated customer tokens attempting to access `/admin/stats` or `/admin/orders` receive `HTTP 403 Forbidden`.

### 2.3 Cryptography, Session & Token Management
* **JWT Security**: Tokens are generated via `jsonwebtoken` using `HS256` symmetric encryption.
  - Expiration is configured with strict lifetime limits (30 days for customers; 24 hours for administrative sessions).
  - Backend strictly enforces that `JWT_SECRET` must be at least 32 characters long at startup; weak or default secrets cause immediate process termination.
* **Password Hashing**: Customer and administrator passwords are encrypted using `bcrypt` with salt round cost factor 10. No plaintext credentials or reversible ciphers are stored.

### 2.4 Injection Flaws & Data Sanitation
* **SQL Injection**: All PostgreSQL interactions across all routes (`auth.ts`, `cart.ts`, `catalog.ts`, `newsletter.ts`, `admin.ts`) utilize strict parameterized SQL queries via `pg.Pool` (e.g. `SELECT * FROM carts WHERE id = $1`). Zero string concatenations or dynamic SQL queries exist.
* **Input Validation & Trimming**:
  - Email addresses are normalized to lowercase and trimmed before DB storage.
  - Indian PIN codes are sanitized with whitespace trimming and validated against `/^[1-9][0-9]{5}$/`.
  - Variant sizes are strictly validated against the allowed chest array (`['38', '40', '42', '44']`); non-numeric or arbitrary strings are rejected with `HTTP 400 Bad Request`.

### 2.5 HTTP Security Headers & Network Hardening
* **Helmet Middleware**: Configured in Express to apply:
  - `X-Content-Type-Options: nosniff` (MIME type sniffing prevention)
  - `X-Frame-Options: SAMEORIGIN` (Clickjacking defense)
  - `X-XSS-Protection: 1; mode=block` (Legacy browser XSS filter)
  - `Strict-Transport-Security` (HSTS: `max-age=31536000; includeSubDomains; preload` in staging/production)
* **CORS Whitelist**: Controlled via `CORS_ORIGIN` environment variable. Cross-origin requests from unauthorized origins are rejected.
* **Rate Limiting**: Configured using `express-rate-limit`:
  - Authentication endpoints: limited to prevent credential stuffing.
  - Newsletter subscriptions: limited to prevent automated spam bot submissions.
  - Checkout submissions: protected against rapid submission loops.

---

## 3. Privacy & DPDP Act 2023 Compliance Audit

| Requirement | Statutory Standard | WAAK Implementation & Audit Finding | Compliance Status |
| :--- | :--- | :--- | :---: |
| **Notice & Opt-In Consent** | DPDP Act Sec. 5 & 6 (Clear consent for specified marketing purpose) | Added clear, unbundled disclosure in footer: *"By submitting, you consent to receive seasonal atelier invitations. Unsubscribe anytime via our Privacy Policy."* | **COMPLIANT** |
| **Right to Withdraw Consent** | DPDP Act Sec. 6(4) (Ease of withdrawal equal to ease of giving) | Added `POST /store/newsletter/unsubscribe` endpoint with status transition to `'unsubscribed'` and timestamp recording. | **COMPLIANT** |
| **Data Leakage Defense** | DPDP Act Sec. 8 (Protection against unauthorized disclosure) | No public endpoint exists to enumerate newsletter subscribers (`GET /store/newsletter` returns 404). Unsubscribe returns generic 200 OK regardless of email presence. | **COMPLIANT** |
| **Grievance Redressal** | DPDP Act Sec. 12 & E-Commerce Rules (Designated Grievance Officer) | Draft placeholder in `/privacy-policy`. Formal officer name, contact email, and escalation address require business appointment. | **PENDING BUSINESS ACTION** |

---

## 4. Git Repository History & Credential Hygiene

### 4.1 Repository Secret History Audit
* **Analysis**: In Phase 2.2, `backend/.env` was removed from the active Git index and added to `.gitignore`.
* **Historical Commit Review**: Historical Git commits (specifically prior commits in branch history) must be audited by DevOps using tools such as `trufflehog` or `git-filter-repo` before making the repository public or granting broad third-party access.
* **Credential Rotation Rule**: Any credentials, API keys, or webhook secrets that ever existed in local development files must be treated as compromised and **never reused in production**.

### 4.2 Production Secret Isolation Rules
1. Never commit `.env` or production credentials to Git.
2. Inject production secrets exclusively via secure container environment variables or cloud secret managers (e.g. AWS Secrets Manager, HashiCorp Vault, Doppler).
3. Ensure the Razorpay Live Key ID and Live Secret Key are only provided to the container at deployment runtime.
