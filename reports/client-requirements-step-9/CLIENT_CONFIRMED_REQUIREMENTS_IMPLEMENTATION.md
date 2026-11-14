# WAAK Occasionwear — Step 9.1: Client-Confirmed Business Requirements Implementation Report

**Milestone**: Step 9.1 Technical Implementation & Staging Verification  
**Audience**: Ankur, WAAK Brand Leadership, Staging Technical Audit  
**Date**: November 14, 2026  
**Git Branch**: `feature/client-confirmed-requirements`  
**Git Checkpoint**: Committed on `feature/client-confirmed-requirements`  

---

## 1. Executive Summary & Client Directions Received

Client Ankur provided several critical business decisions resolving previously pending governance items:
1. **Size Range**: Authorized sizes **36, 38, 40, 42, 44** across all catalog products. Inventory quantities to be managed authoritatively via the Atelier Admin Panel without fabricating blanket availability.
2. **Returns & Exchanges Policy**: 
   - 2-day request window from delivery completion notification.
   - Mandatory prior written authorization from WAAK before return dispatch.
   - Garment must be unused with original packaging and tags attached.
   - Mandatory atelier quality inspection upon receipt.
   - Lifetime store credit issued upon passing inspection (strictly no cash refunds).
   - Return/reverse courier charges are the customer's responsibility.
3. **Shipping Integration**:
   - Primary carrier partner: **Shiprocket**.
   - Mandatory courier partner anonymity: Carrier names (Blue Dart, Delhivery, etc.) must **never** be displayed to storefront customers.
   - Real PIN code serviceability and estimated delivery timelines queried via Shiprocket API.
4. **WhatsApp Contact Confirmation**:
   - Confirmed official customer-support line: **+91 98217 07031** (normalized: `919821707031`), kept distinct from personal executive lines.
5. **Official Business Details**:
   - Legal Entity: **ENGLISH CHANNEL COMPANY** (trading as WAAK Occasionwear).
   - Registered Address: **37, Furniture Market, Gandhi Nagar, Delhi – 110033**.
   - GSTIN: **07AAGFE4560K1ZA**.
6. **Product Photography Approval & Content Intake**:
   - Structured visual catalog prepared for client review and formal sign-off.
   - Content intake framework prepared for client-supplied fabric and craftsmanship descriptions.
7. **BodhX AI Token Hygiene**:
   - Exposed token quarantined; widget disabled pending receipt of regenerated token.

---

## 2. Inventory of Changes

### A. Backend Architecture & API Enhancements
| File | Changes Made |
| :--- | :--- |
| `backend/src/db/migrations/004_add_size_36_variants.sql` | Database migration inserting size 36 variants across all catalog products with initial stock 0 (authoritative client entry). |
| `backend/src/db/seed.ts` | Updated seed script to include sizes 36, 38, 40, 42, 44. |
| `backend/src/routes/carts.ts` | Updated size validation schema to accept `['36', '38', '40', '42', '44']`. |
| `backend/src/services/shiprocket.ts` | Created Shiprocket integration service with token caching (9-day TTL), 6-digit Indian PIN validation, 1-hour PIN result caching, carrier masking, and staging fallback. |
| `backend/src/routes/shipping.ts` | Created `/store/shipping/serviceability` and `/store/shipping/status` routes with IP rate limiting (30 req/min). |
| `backend/src/middleware/rateLimiter.ts` | Added `shippingRateLimiter` with memory cleanup. |
| `backend/src/index.ts` | Mounted shipping routes at `/store/shipping` and `/api/shipping`. |

### B. Frontend Merchandising & Storefront Enhancements
| File | Changes Made |
| :--- | :--- |
| `src/data/products.ts` | Updated `availableSizes` across all 9 products to `["36", "38", "40", "42", "44"]`. |
| `src/ProductDetail.tsx` | Updated fallback sizes to `["36", "38", "40", "42", "44"]`; integrated real PIN code verification querying `api.shipping.checkServiceability`; updated exchange policy FAQ and accordions to 2-day request window with lifetime store credit. |
| `src/context/AppContext.tsx` | Updated product enrichment mapping to include size 36. |
| `src/services/api.ts` | Added `api.shipping.checkServiceability(pincode)` and `api.shipping.getStatus()`. |
| `src/components/PolicyView.tsx` | Updated Returns & Exchanges policy to 2-day window, mandatory return authorization, customer-paid reverse shipping, atelier inspection, and lifetime store credit (no cash refunds). Updated `/contact` section with registered business entity (English Channel Company, Gandhi Nagar, GSTIN, and WhatsApp concierge). |
| `src/components/Footer.tsx` | Added registered business entity and GSTIN details to footer brand block; updated policy link to "Returns & Exchanges (2-Day Window)". |
| `.env.example` | Updated `VITE_WHATSAPP_NUMBER=919821707031` with confirmed customer concierge line. |

---

## 3. Shiprocket Integration Specifications & Governance

1. **Authentication**:
   - `POST https://apiv2.shiprocket.in/v1/external/auth/login`
   - Configured via server-side environment variables `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD`.
   - Never exposed to frontend code or browser runtime.
2. **Serviceability Query**:
   - `GET https://apiv2.shiprocket.in/v1/external/courier/serviceability/`
   - Default warehouse pickup: `110033` (Gandhi Nagar, Delhi).
   - Validated destination: 6-digit Indian PIN (`/^[1-9][0-9]{5}$/`).
3. **Courier Partner Anonymity (Crucial Client Rule)**:
   - All internal partner names (e.g. Blue Dart, Delhivery, Ecom Express) are filtered out on the Express server.
   - Customer response displays generic luxury tier: `"Express Insured Atelier Delivery"`.
4. **Staging Unconfigured Fallback**:
   - When carrier credentials are pending from the client, the service returns valid regional dispatch estimates (2–3 days for Delhi NCR; 3–5 days across India) without generating 500 errors.

---

## 4. Pending Client Dependencies & Next Steps

| Item | Client Action Required | Current Status in Repo |
| :--- | :--- | :--- |
| **Shiprocket Credentials** | Client to supply `SHIPROCKET_EMAIL` & `SHIPROCKET_PASSWORD` | Service scaffold active; unconfigured fallback active |
| **BodhX AI Token** | Client to regenerate widget token in BodhX dashboard | Widget loader disabled (`VITE_BODHX_WIDGET_ENABLED=false`) |
| **Photography Approval** | Client to review `PRODUCT_IMAGE_APPROVAL_CATALOG.md` | 14 assets cataloged and mapped |
| **Product Descriptions** | Client to fill out content intake template | Template provided in approval catalog |
| **Inventory Stock Counts** | Client to enter stock counts for sizes 36–44 via Admin Panel | Size 36 initialized with 0 stock; Admin console ready |
| **Legal Document Review** | Formal review of draft policy wording | Draft notices retained on all policy pages |
| **Razorpay Production Key** | Client approval for live KYC and production key | Strictly maintained on TEST sandbox (`rzp_test_waak2026demo`) |
