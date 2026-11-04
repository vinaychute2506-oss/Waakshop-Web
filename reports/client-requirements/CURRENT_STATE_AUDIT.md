# WAAK — Current State Technical Audit

**Audit Date**: November 2026  
**Repository Working Tree**: Clean  
**Latest Feature Commit**: `a0cb1cf` on `feature/phase3-5-release-readiness`  
**Baseline Anchor**: Tag `waak-v3.1-client-preview` (`097dfb1`, commit `ae75687`)

---

## 1. Responsive Breakpoints Inventory

Inspecting [`src/Home.css`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/src/Home.css) and [`src/ProductDetail.tsx`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/src/ProductDetail.tsx) reveals the active responsive media query breakpoints:

| Breakpoint | Target Screen Type | File & Line Reference | Current Layout Behavior | Identified Defect / Limitation |
| :--- | :--- | :--- | :--- | :--- |
| **`> 1200px`** | Desktop Large (1440px) | `Home.css:451-455` | 4-column catalog grid (`repeat(4, 1fr)`) | Cards are ~330px wide, image height reaches 473px; dominates vertical screen space. |
| **`1200px`** | Desktop Standard / Laptop | `Home.css:949-982` | 2-column New Arrivals (`repeat(2, 1fr)`), 3-column main catalog | Sudden jump from 4 to 2 columns in New Arrivals leaves excess whitespace. |
| **`960px` / `900px`** | Tablet Landscape | `ProductDetail.tsx:2119`, `Home.css:984` | PDP grid collapses to 1 column (`grid-template-columns: 1fr`) | Gallery image becomes full-width (~900px wide $\times$ 1230px tall), requiring enormous scroll distance to reach product details. |
| **`768px`** | Tablet Portrait | `Home.css:991-1038` | Catalog 2 columns; category circles shrink to 70px | Category circle container lacks scroll snap; titles wrap awkwardly. |
| **`480px`** | Mobile Large (Phablet) | `Home.css:1040-1089` | Catalog collapses to **single column** (`grid-template-columns: 1fr; max-width: 320px; margin: 0 auto;`) | **Root Cause of Client Feedback**: Each product card takes up the entire mobile screen width and height. Browsing 4 products requires 4 full viewport scrolls. |
| **`390px`** | Standard Mobile (iPhone 14/15) | `Home.css:1092-1103` | Category circles shrink to 64px; titles shrink to 27px | Sticky action bar text truncates if garment name is long. |
| **`360px` / `320px`** | Small Mobile (Android / SE) | `Home.css:1105-1116` | Hero font 24px; circles 58px | Policy tables overflow horizontally; CheckoutModal padding causes inputs to compress. |

---

## 2. Image Aspect Ratios & Object-Fit Behavior

| Component / Surface | Aspect Ratio Specified | CSS Class | `object-fit` | `object-position` | Visual Result |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Hero Campaign Image** | None (Container `min-height: 90vh`) | `.hero-campaign-img` | `cover` | `right center` (mobile: `75% center`) | High quality; good focal point framing for bride/groom silhouettes. |
| **Category Circles** | `1 / 1` (Circle 80px/70px/58px) | `.category-circle-img` | `cover` | `center center` | Cleanly framed collar/embroidery circular cameos. |
| **Homepage New Arrivals** | **`3 / 4.3`** (~0.697) | `.new-arrival-image-box` | `cover` | `center top` | **Excessively tall**. On mobile (320px card), height is 458px. On desktop (330px card), height is 473px. |
| **Main Catalog Grid** | **`3 / 4.3`** (~0.697) | `.product-card-standard` | `cover` | `center top` | Same tall ratio. Causes vertical fatigue across multi-product listings. |
| **PDP Main Gallery Image** | **`3 / 4.1`** (~0.731) | `.pdp-main-image-wrap` | `cover` | `center center` | **Excessively tall**. At 358px mobile width, height is 490px (60% of viewport). Pushes buy button and sizing out of sight. |
| **PDP Thumbnails** | Fixed `78px` $\times$ `102px` | `.pdp-thumbnail-card` | `cover` | `center center` | Good proportions, but thumbnail strip lacks native scroll-snap on mobile. |
| **Sticky Action Bar Thumb** | Fixed `44px` $\times$ `56px` | `.pdp-sticky-thumb` | `cover` | `center center` | Crisp miniature silhouette preview. |

---

## 3. Fixed Widths, Heights & Overflow Points

1. **Homepage New Arrivals Grid Container ([`src/Home.css:1075`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/src/Home.css#L1075))**:
   - `max-width: 320px; margin: 0 auto;` artificially constrains mobile screens (375px, 390px, 430px) to a centered 320px column with wasted side margins.
2. **Category Scroll Strip ([`src/Home.css:307`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/src/Home.css#L307))**:
   - `.category-pill-button { flex: 0 0 102px; width: 102px; }`
   - Fixed width of 102px per pill across 5 pills requires at least 510px. On 320px/360px devices, the 4th and 5th pills are clipped without an obvious horizontal scroll cue.
3. **Policy Comparison Tables ([`src/components/PolicyView.tsx:253`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/src/components/PolicyView.tsx#L253))**:
   - Measurement and delivery tables use `width: 100%; border-collapse: collapse; min-width: 480px;` wrapped in `overflowX: "auto"`. On 320px devices, horizontal scrolling is functional but lacks visual shadow cues indicating more columns exist.
4. **Checkout Modal Grid ([`src/components/CheckoutModal.tsx:432`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/src/components/CheckoutModal.tsx#L432))**:
   - `gridTemplateColumns: '2fr 2fr 1.5fr'` (City, State, PIN). On narrow mobile screens ($<360\text{px}$), the 3 columns cause inputs to compress below 70px width, clipping placeholders like "110001".

---

## 4. Current Checkout Security & Payment Flow

Inspecting [`backend/src/routes/checkout.ts`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/backend/src/routes/checkout.ts) confirms the verified security protections:
- **Server Price Authority**: `ci.unit_price` is read directly from PostgreSQL `product_variants` and `products` tables. The server ignores any client-supplied total or line item price (`checkout.ts:43-60`).
- **Atomic Concurrency & Row Locks**: Line item reservation executes inside a PostgreSQL transaction (`BEGIN ... COMMIT`) using `SELECT ... FOR UPDATE` on `product_variants`. If available stock is insufficient, the transaction rolls back cleanly with HTTP 409 (`checkout.ts:230-258`).
- **Cryptographic Signature Verification**:
  ```typescript
  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  isValid = safeCompare(generatedSignature, razorpay_signature);
  ```
  Uses timing-safe comparison (`crypto.timingSafeEqual`) to eliminate timing side-channels (`checkout.ts:182-188`).
- **Idempotency Protection**: If a duplicate payment verification or duplicate webhook replay is received for an already `captured` order, stock is **not** decremented a second time; the confirmed order is returned idempotently (`checkout.ts:214-227`).
- **Data Isolation**: Cross-customer cart viewing, address deletion, or order inspection without the corresponding JWT token is blocked with `HTTP 403 Forbidden` (`carts.ts:47`, `orders.ts:16`).

---

## 5. Existing Exchange Policy & Draft Warnings

- **Route Availability**: Accessible at both `/returns-and-exchanges` and alias `/returns`.
- **Policy Content**:
  - 7-calendar-day exchange and alteration window for standard sizes (38, 40, 42, 44).
  - Bespoke/custom-tailored garments excluded from cash refund, but eligible for master-tailor adjustment.
  - Concierge reverse courier pickup mentioned.
- **Draft Status**: Prominently displayed at top of policy view in an amber border box:
  > *"Legal & Business Review Status: Unapproved Draft Policy (Pending Corporate Confirmation) — This document represents an unapproved internal draft... Commercial terms (including return/exchange timeframes, express dispatch guarantees, transit insurance) and statutory corporate details remain unconfirmed and are not legally binding until formal executive sign-off prior to commercial activation."*
- **PDP Integration**: Accordion 4 on PDP includes draft disclaimer:
  > *"Note: Courier transit windows and insurance representations represent draft operational standards subject to carrier partner confirmation."*

---

## 6. WhatsApp & Contact Functionality Audit

- **Existing Code**: No active WhatsApp integration exists.
- **Reference in Code**: [`src/components/PolicyView.tsx:451`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/src/components/PolicyView.tsx#L451) states:
  > *"Direct WhatsApp & Telephonic Line: Dedicated line allocation pending commercial carrier provisioning."*
- **Evaluation**: The application currently has zero outbound WhatsApp functionality. Adding a button without a real business WhatsApp number would lead to broken `wa.me/` URLs or customer frustration.

---

## 7. Backend AI / LLM Code Audit

- **Dependencies**: Inspected [`backend/package.json`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/backend/package.json). Dependencies are strictly:
  `bcryptjs`, `cors`, `dotenv`, `express`, `jsonwebtoken`, `pg`, `razorpay`.
- **Code Search**: Zero occurrences of `openai`, `anthropic`, `gemini`, `langchain`, `llm`, or `ai` exist across `backend/src/` or `src/`.
- **Evaluation**: The backend is completely standard REST. No LLM integration work has begun, which matches the required disciplined sequence.
