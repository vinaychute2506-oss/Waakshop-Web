# WAAK Product Data Requirements & Gap Analysis
**Phase 3.3 Audit Deliverable**

---

## 1. Overview

During Phase 3.3, a comprehensive audit of the database schema (`backend/src/db/schema.sql`), seed data (`backend/src/db/seed.ts`), and static editorial catalog (`src/data/products.ts`) was conducted. This document outlines verified data assets, missing attributes, and business decisions required for full production scaling.

---

## 2. Product Media & Photography Gaps

| Product ID | Garment Name | Existing Views | Gaps & Requirements |
|---|---|:---:|---|
| `waak-01` | The Ivory Zardozi Sherwani | 3 Views (Front, 3/4 drape, embroidery closeup) | Requires high-resolution back embroidery view, model movement video clip (1080p WebM/MP4), and lining craftsmanship macro shot. |
| `waak-02` | Midnight Velvet Sherwani | 2 Views (Front, texture) | Requires 3/4 angle, collar hook closure detail, and high-contrast indoor evening lighting view. |
| `waak-03` | Mauve Raw Silk Bandhgala | 2 Views (Front, full look) | Requires buttonwork closeup (Varanasi antique brass), pocket detail, and fabric weave macro shot. |
| `waak-04` | Emerald Tussar Silk Kurta | 2 Views (Front, stole drape) | Requires placket embroidery closeup, churidar waistband detail, and chanderi stole texture shot. |
| Items 5–9 | Archival Preview Models | 1 View each (Framer CDN) | Currently single-view lookbook shots. Need dedicated multi-angle atelier studio photography before enabling online direct checkout. |

---

## 3. Product Specification Gaps

1. **Colour Variants**:
   - Currently, each garment exists as an independent bespoke design in a signature colorway (e.g. Royal Ivory, Midnight Navy, Dusty Mauve, Jewel Emerald).
   - *Requirement*: The database schema does not have a `color` column in `product_variants`. If WAAK intends to offer the same sherwani silhouette in multiple colorways (e.g., Ivory vs. Champagne vs. Sage), a `color_name` and `color_hex` swatch column must be added to `product_variants`.
2. **Detailed Measurement Dimensions**:
   - Numeric chest sizes (`38`, `40`, `42`, `44`) are fully supported.
   - *Requirement*: The business should supply verified collar circumference, bicep width, and trouser inseam/outseam lengths for the size chart.

---

## 4. Infrastructure Gaps (Policy & Service Integrations)

### 4.1 Customer Reviews System
- **Current State**: Neither the PostgreSQL database nor the Express API has a `reviews` or `ratings` table.
- **Decision Taken**: In accordance with the prompt guidelines, **zero fake reviews or fabricated testimonials were introduced**.
- **Requirement for Future Milestone**: Build a verified buyer review system:
  - Table: `reviews (id, customer_id, order_id, product_id, rating, title, comment, verified_purchase, created_at)`
  - Endpoint: `POST /store/products/:id/reviews` (authorized only for patrons who completed an order for that product).

### 4.2 Courier Partner API (Serviceability & Real-Time Tracking)
- **Current State**: PIN-code verification validates the authentic 6-digit Indian PIN format (`/^\d{6}$/`).
- **Requirement for Future Milestone**: Integrate a logistics API (such as Shiprocket, Delhivery, or Blue Dart):
  - Serviceability endpoint: `POST /store/shipping/check-serviceability { postal_code }`
  - Real-time rate calculation, Cash-on-Delivery (COD) availability check, and live transit estimates.

---

## 5. Summary of Safe Implementations & Fallbacks

- **No Fictional Specifications**: Where exact measurements were unavailable, clear notes on standard chest sizing and complimentary tailor adjustments are provided.
- **Image Failure Resilience**: Local verified assets act as seamless fallbacks if remote URLs fail.
- **Transparent Honesty**: The PIN checker explicitly explains that transit confirmation is provided at dispatch, avoiding invented delivery dates.
