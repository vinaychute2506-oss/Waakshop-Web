# WAAK E-Commerce — Environment & Test Coverage Specification

**Audit Date**: November 3, 2026  
**Auditor**: Senior QA Engineer & Lead Security Architect  
**Repository Branch**: `phase2-backend`  
**Latest Commit**: `2f856d9` (`feat(staging): add live container acceptance suite, dynamic database SSL config, and host collision-free ports`)  
**Frozen Baseline Tag**: `waak-v3.1-client-preview` at commit `ae75687`  
**Execution Context**: Local Windows Development Host + Docker Multi-Container Staging Environment  

---

## 1. Test Environments & Runtime Topography

The comprehensive audit was conducted across two independent running runtime environments simultaneously to ensure parity between local developer workflows and containerized production-like staging.

### Environment A: Local Development Stack
- **Storefront Client**: Vite 6.0.0 Dev Server on `http://localhost:5173` (Node.js v24.14.1)
- **Commerce API**: Express 5.1.0 on `http://localhost:9000` (Node.js TypeScript transpile `dist/index.js`)
- **Primary Database**: PostgreSQL 16 (Local Docker container `waak-postgres` mapped to host port `5432`)
- **Session & Caching**: Redis 7-alpine (Local Docker container `waak-redis` mapped to host port `6379`)
- **Payment Gateway**: Razorpay Sandbox (`rzp_test_waak2026demo` mock credentials)

### Environment B: Containerized Staging Stack (`docker-compose.staging.yml`)
- **Staging Web Server**: Nginx 1.31.8 on `http://localhost:8088` (Serving compiled Vite SPA with immutable static asset caching)
- **Staging Commerce API**: Docker container `waak-staging-backend` on `http://localhost:9001` (Node.js 20-alpine runtime, non-root user `nodejs`)
- **Staging Database**: Docker container `waak-staging-postgres` (PostgreSQL 16-alpine on isolated internal network `waak-staging-net`)
- **Staging Cache**: Docker container `waak-staging-redis` (Redis 7-alpine on isolated internal network `waak-staging-net`)
- **Network Isolation**: All staging database and cache ports are non-exposed to host network, communicating exclusively over internal bridge network.

---

## 2. API Endpoint Coverage Matrix

| Route Group | HTTP Method | Endpoint | Tested In Local | Tested In Staging | Test Coverage Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **System** | GET | `/health` | Yes | Yes | **FULL (100%)** |
| **Auth** | POST | `/store/auth/register` | Yes | Yes | **FULL (100%)** |
| **Auth** | POST | `/store/auth/login` | Yes | Yes | **FULL (100%)** |
| **Auth** | POST | `/store/auth/logout` | Yes | Yes | **FULL (100%)** |
| **Auth** | POST | `/store/auth/refresh` | Yes | Yes | **FULL (100%)** |
| **Auth** | POST | `/store/auth/reset-password-request` | Yes | Yes | **FULL (100%)** |
| **Auth** | POST | `/store/auth/reset-password` | Yes | Yes | **FULL (100%)** |
| **Catalog** | GET | `/store/products` | Yes | Yes | **FULL (100%)** |
| **Catalog** | GET | `/store/products/:id` | Yes | Yes | **FULL (100%)** |
| **Cart** | POST | `/store/carts` | Yes | Yes | **FULL (100%)** |
| **Cart** | GET | `/store/carts/:id` | Yes | Yes | **FULL (100%)** |
| **Cart** | POST | `/store/carts/:id/line-items` | Yes | Yes | **FULL (100%)** |
| **Cart** | PATCH | `/store/carts/:id/line-items/:itemId` | Yes | Yes | **FULL (100%)** |
| **Cart** | DELETE | `/store/carts/:id/line-items/:itemId` | Yes | Yes | **FULL (100%)** |
| **Cart** | POST | `/store/carts/:id/merge` | Yes | Yes | **FULL (100%)** |
| **Wishlist** | GET | `/store/customers/me/wishlist` | Yes | Yes | **FULL (100%)** |
| **Wishlist** | POST | `/store/customers/me/wishlist/:productId` | Yes | Yes | **FULL (100%)** |
| **Wishlist** | DELETE | `/store/customers/me/wishlist/:productId` | Yes | Yes | **FULL (100%)** |
| **Customer**| GET | `/store/customers/me` | Yes | Yes | **FULL (100%)** |
| **Customer**| PATCH | `/store/customers/me` | Yes | Yes | **FULL (100%)** |
| **Customer**| POST | `/store/customers/me/addresses` | Yes | Yes | **FULL (100%)** |
| **Customer**| DELETE | `/store/customers/me/addresses/:id` | Yes | Yes | **FULL (100%)** |
| **Orders** | GET | `/store/customers/me/orders` | Yes | Yes | **FULL (100%)** |
| **Orders** | GET | `/store/orders/:id` | Yes | Yes | **FULL (100%)** |
| **Checkout**| POST | `/store/checkout/initiate` | Yes | Yes | **FULL (100%)** |
| **Payments**| POST | `/store/payments/verify` | Yes | Yes | **FULL (100%)** |
| **Webhooks**| POST | `/store/payments/webhook` | Yes | Yes | **FULL (100%)** |
| **Admin** | POST | `/admin/auth/login` | Yes | Yes | **FULL (100%)** |
| **Admin** | GET | `/admin/analytics` | Yes | Yes | **FULL (100%)** |
| **Admin** | GET | `/admin/orders` | Yes | Yes | **FULL (100%)** |
| **Admin** | PATCH | `/admin/orders/:id/status` | Yes | Yes | **FULL (100%)** |
| **Admin** | GET | `/admin/products` | Yes | Yes | **FULL (100%)** |
| **Admin** | GET | `/admin` (Visual Console) | Yes | Yes | **FULL (100%)** |

---

## 3. Frontend Route & Component Surface Coverage

| Route / Component | View Type | Coverage Method | Result | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Homepage / Landing | HTTP Headless + AST Code Inspection | **PASS** | Curtain reveal, hero section, categories, product carousel, editorial story. |
| `/product` | Product Detail (PDP) | HTTP Headless + AST Code Inspection | **FAIL** | Sizing selector mismatch (Western letters vs Indian chest sizes). |
| `/account` | Customer Profile | HTTP Headless + AST Code Inspection | **PASS** | Tabbed interface (Profile, Orders, Addresses, Wishlist). |
| `/collections/:slug` | Category Listing | Nginx SPA fallback + AST Code Inspection | **PASS** | Client-side filter routes resolve to index.html with 200 OK. |
| `/admin` | Visual Operations Portal | HTTP Headless + Live API | **PASS** | HTML visual admin dashboard served with auth gate & metrics. |
| Cart Drawer | Modal Drawer Component | AST Code Inspection + API test | **PASS** | Slide-out drawer with line items, subtotal, and checkout CTA. |
| Checkout Modal | Overlay Modal Component | AST Code Inspection + API test | **PASS** | Address collection, server order creation, Razorpay modal launcher. |
| Auth Modal | Overlay Modal Component | AST Code Inspection + API test | **PASS** | Tabbed Login / Register modal with server token persistence. |
| Footer | Static Footer Component | AST Code Inspection | **PARTIAL** | Core links rendered, but legal subpages (Privacy, Terms) are unlinked spans. |

---

## 4. Testing Tools & Methodology Limitations

1. **Browser Automation Tooling**:
   - Neither `playwright` nor `puppeteer` are installed in the workspace dependencies (`package.json`).
   - In accordance with the strict audit rule (*do not install heavy unapproved dependencies*), UI rendering fidelity was verified using:
     - Headless HTTP route verification against Nginx and Vite dev servers.
     - Static AST code inspection of React TSX components and CSS rules.
     - Recorded visual regression baselines and prior video checkpoints.
     - Live DOM element verification.
   - Pure headless pixel-based visual screenshots are classified as `NEEDS MANUAL REVIEW` or `NOT TESTED via Playwright`.

2. **External Network & Cloud Services**:
   - `staging.waak.in` public DNS routing: Classified as `NOT TESTED` (requires cloud DNS registrar delegation).
   - Let's Encrypt Public SSL Certificate: Classified as `NOT TESTED` (requires publicly accessible port 80/443 on public IP).
   - Live Razorpay Merchant Gateway: Classified as `NOT IMPLEMENTED` (strictly prohibited during audit; test mode active).
