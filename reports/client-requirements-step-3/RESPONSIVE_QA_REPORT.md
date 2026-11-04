# WAAK Responsive QA Report — Step 3
## Visual and Layout Inspection of Customer Trust Elements Across Viewports

**Project:** WAAK Atelier E-Commerce Web Storefront  
**Phase:** Client Requirements Remediation — Step 3  
**Audit Tool:** Headless Chrome CDP Automation (`scratch/visual_qa_step3.py`)  
**Audit Date:** November 4, 2026  
**Artifacts Location:** `scratch/qa_screenshots_step3/`  

---

### 1. Viewport Measurement Summary

Visual inspection was executed across seven standard device viewports, specifically targeting narrow mobile widths (320px and 375px) where dense trust cards frequently cause container clipping, button squishing, or horizontal scrolling.

| Viewport Profile | Dimensions | Document Width | Horizontal Overflow | PDP Trust Card Status | Checkout Modal Status | Submit Button Height |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile Narrow** | 320 × 640 px | 320 px | **No (0px)** | Present (295 × 267 px) | Present (300 × 602 px) | **69 px** (Compliant) |
| **Mobile Standard** | 375 × 667 px | 375 px | **No (0px)** | Present (347 × 233 px) | Present (355 × 602 px) | **62 px** (Compliant) |
| **Mobile iPhone 14/15** | 390 × 844 px | 390 px | **No (0px)** | Present (362 × 233 px) | Present (370 × 602 px) | **62 px** (Compliant) |
| **Mobile Pro Max** | 430 × 932 px | 430 px | **No (0px)** | Present (402 × 233 px) | Present (410 × 602 px) | **62 px** (Compliant) |
| **Tablet Portrait** | 768 × 1024 px | 768 px | **No (0px)** | Present (716 × 204 px) | Present (480 × 602 px) | **48 px** (Compliant) |
| **Desktop Small** | 1024 × 768 px | 1009 px | **No (0px)** | Present (460 × 220 px) | Present (480 × 602 px) | **48 px** (Compliant) |
| **Desktop Widescreen** | 1440 × 900 px | 1425 px | **No (0px)** | Present (540 × 220 px) | Present (480 × 602 px) | **48 px** (Compliant) |

---

### 2. Detailed Viewport Analysis

#### 2.1 Mobile 320px (Worst-Case Narrow Screen)
- **PDP Trust Card**:
  - Rendered width: 295px inside a 320px viewport (12.5px margins on each side).
  - All 4 trust items displayed with vertical stacking; icon and text aligned with `gap: 10px`.
  - Policy links formatted with clean inline text buttons (`font-size: 11px`, `color: var(--color-burgundy)`).
  - Document scroll width: exactly 320px. **Zero horizontal overflow**.
- **Checkout Modal**:
  - Modal card width: 300px (10px margin on each side of the screen).
  - Security card width: 262px. Bullet points wrap cleanly without text clipping.
  - Submit button wraps gracefully across 2 lines:
    `Pay ₹99,000 via Razorpay` / `(Staging Sandbox · Test Mode)`.
  - Button height expands to **69px**, well exceeding the 44px minimum touch target requirement.

#### 2.2 Mobile 375px (Standard iPhone SE / 8)
- **PDP Trust Card**: Width 347px, height 233px.
- **Checkout Modal**: Width 355px. Security list items wrap evenly. Submit button height is **62px** with touch target compliance.
- **Horizontal Overflow**: None (`docWidth === winWidth === 375px`).

#### 2.3 Mobile 390px & 430px (Modern Mobile)
- Generous padding and legibility. Icon badges render at `24 × 24 px` with burgundy backgrounds and gold icons.
- All primary actions (Add to Bag, Wishlist, Policy Modals, Checkout) have touch targets $\ge 44\text{px}$.

#### 2.4 Tablet 768px & Desktop 1024px / 1440px
- On tablet and desktop, the checkout modal is capped at `max-width: 480px` centered on the viewport.
- PDP trust card sits gracefully beneath the primary action buttons in the sticky/scrolling column, keeping primary CTA above the lower fold on widescreen devices.
- Submit button height stabilizes at **48px** with single-line layout.

---

### 3. Screenshot Capture Log

All captured visual proofs are persisted in `scratch/qa_screenshots_step3/`:
- `pdp_trust_mobile_320.png`
- `checkout_trust_mobile_320.png`
- `pdp_trust_mobile_375.png`
- `checkout_trust_mobile_375.png`
- `pdp_trust_mobile_390.png`
- `checkout_trust_mobile_390.png`
- `pdp_trust_mobile_430.png`
- `checkout_trust_mobile_430.png`
- `pdp_trust_tablet_768.png`
- `checkout_trust_tablet_768.png`
- `pdp_trust_desktop_1024.png`
- `checkout_trust_desktop_1024.png`
- `pdp_trust_desktop_1440.png`
- `checkout_trust_desktop_1440.png`
