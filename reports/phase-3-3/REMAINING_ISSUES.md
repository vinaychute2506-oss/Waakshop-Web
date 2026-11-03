# WAAK Phase 3.3 — Remaining Issues & Roadmap

---

## 1. Status of Resolved Items

| Item | Status | Verification |
|---|---|---|
| **Premium Product Image Gallery** | **Resolved** | 3:4.1 main image, touch/button next/prev navigation, thumbnail active states, zoom lightbox with Escape key, and local fallback on error. |
| **Authoritative Pricing & Genuine Savings** | **Resolved** | Displays real backend price in INR, real computed discount %, and struck-through original price only when genuine original price exists. |
| **Numeric Sizing & Stock Alerts** | **Resolved** | Sizing strictly constrained to authentic Indian chest sizes `38`, `40`, `42`, `44`. Real-time stock status based on PostgreSQL variant inventory. |
| **Sticky Mobile Purchase Bar** | **Resolved** | Appears smoothly when main button scrolls out of view via `IntersectionObserver`. Synchronized with size selection and safe-area padding. |
| **Delivery PIN Code Checker** | **Resolved** | 6-digit format verification without fake courier claims. |
| **Craftsmanship Accordions** | **Resolved** | Semantic, accessible accordions detailing silhouette, fabric, care, and insured shipping. |
| **Size Guide Modal** | **Resolved** | Dual units (Inches & cm) for chest sizes, measuring tips, keyboard trap, and focus return. |
| **Curated Atelier FAQs** | **Resolved** | Verified questions covering sizing, custom tailoring, garment packaging, and exchange policies. |
| **Regression Protection** | **Resolved** | 226/226 automated test assertions pass with 0 failures across dev and staging. 0 TypeScript build errors. |

---

## 2. Business Decisions Required

1. **Atelier Exchange & Return Window**:
   - The PDP reflects a 7-day complimentary bespoke exchange policy for standard sizes. The business should confirm whether custom altered garments are eligible for partial exchange or store credit.
2. **Expansion of Product Line (Items 5–9)**:
   - Archival items (`black-tailored-suit`, `navy-waistcoat`, `cream-occasion-kurta`, `regal-velvet-sherwani`, `black-waistcoat`) are currently configured with `isAvailableInBackend: false`.
   - Business decision: Once studio inventory is ready, seed these 5 garments into the PostgreSQL database to enable direct checkout.

---

## 3. Recommended Next Phase (Phase 3.4)

1. **Phase 3.4: Legal & Policy Destinations**
   - Create dedicated standalone routes for:
     - `/shipping-policy`
     - `/returns-and-exchanges`
     - `/privacy-policy`
     - `/terms-of-service`
   - Connect footer navigation links to eliminate 404 or dead link behaviors.
2. **Newsletter Backend Persistence**
   - Implement `POST /store/newsletter` in the Express API and persist subscriber emails in PostgreSQL with duplicate protection.
3. **Logistics Courier API Integration**
   - Integrate a production logistics gateway (e.g. Shiprocket or Delhivery) to enable live PIN-code courier serviceability checks and automated tracking links.
