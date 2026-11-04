# WAAK — Product Image Sizing & Mobile Responsive Plan

**Target Phase**: Implementation Preparation (Post-Client Feedback)  
**Scope**: Storefront Visual Hierarchy, Aspect Ratios, Mobile Grid System, and Viewport Fluidity  
**Operating State**: Controlled Staging Only

---

## 1. Problem Definition: Why Product Photos Look "Too Big"

From the client feedback and our technical audit in `CURRENT_STATE_AUDIT.md`, three concrete design and CSS issues cause the product imagery to appear disproportionately large and overwhelming:

1. **Extreme Vertical Aspect Ratios**:
   - The current aspect ratio of `.new-arrival-image-box` is **`3 / 4.3`** (~0.697) and PDP is **`3 / 4.1`** (~0.731).
   - This ratio was inherited from editorial magazine full-bleed fashion spreads, but in an e-commerce grid, it makes cards overly elongated, causing images to dominate the entire viewport height.
2. **Single-Column Collapse Under 480px**:
   - In `Home.css:1074`, `.new-arrivals-grid` collapses to `grid-template-columns: 1fr; max-width: 320px;`.
   - On an iPhone or Android phone, a single image takes up virtually the entire screen, pushing title and price off-screen and forcing continuous vertical scrolling.
3. **Unconstrained PDP Desktop Hero**:
   - On large desktop displays (1440px), `.pdp-main-grid` allocates `1.05fr` to the left gallery column inside a 1400px container, expanding the primary photo to **650px wide $\times$ 890px high**! The customer cannot see the price, size chips, and Add to Bag without scrolling down.

---

## 2. Proposed Aspect Ratio & Dimension Standards

To balance luxury elegance with functional commerce ergonomics, we propose adopting standard luxury fashion ratios used by leading bridal and occasionwear ateliers (e.g. Sabyasachi, Net-a-Porter, Aza):

| Surface / Component | Current Ratio & Sizing | Proposed Ratio & Sizing | Visual Justification |
| :--- | :--- | :--- | :--- |
| **Catalog Cards (Desktop)** | `3 / 4.3` (330px $\times$ 473px) | **`3 / 4`** (280px $\times$ 373px, max-height 380px) | Reduces card height by **~100px** (-21%), bringing product title, price, and colorway chips into immediate view. |
| **Catalog Cards (Tablet 768px)** | `3 / 4.3` (350px $\times$ 500px) | **`3 / 4`** (3-column or 2-column, max-height 360px) | Prevents 2 cards from monopolizing a full iPad portrait screen. |
| **Catalog Cards (Mobile $\le 480\text{px}$)** | `3 / 4.3` in **1 column** (320px $\times$ 458px) | **`3 / 4`** in **2-column grid** (~170px $\times$ 226px) | **Key Solution**: Customers can view 2 products per row, halving scrolling distance while maintaining clear embroidery details. |
| **PDP Main Gallery (Desktop)** | `3 / 4.1` (650px $\times$ 890px) | **`3 / 4`** (max-width 500px, max-height **620px**) | Keeps the entire hero (image + title + price + size selector + Add to Bag) **above the fold** on standard laptop screens (1080p). |
| **PDP Main Gallery (Mobile)** | `3 / 4.1` (358px $\times$ 490px) | **`4 / 5`** or **`1 / 1.2`** (max-height **380px**) | Reduces mobile PDP photo height by **110px** (-22%), revealing the title and gold price badge immediately upon page load. |

---

## 3. Responsive Screen-by-Screen Audit Matrix

Tested and modeled across the 7 representative viewport widths requested:

| Viewport Width | Screen Type | Surface | Current Behavior | Proposed Improvement & Acceptance Criteria |
| :---: | :--- | :--- | :--- | :--- |
| **`320px`** | iPhone SE (1st gen) | Homepage Hero | Hero title 24px, buttons stack vertically | Title clamped to `22px`; actions full-width; padding 12px; zero horizontal overflow. |
| **`320px`** | Small Mobile | Catalog Grid | Single column 320px card; margins clipped | 2-column grid (`repeat(2, 1fr)`) with 8px gap; card width ~144px; touch targets $\ge 44\text{px}$. |
| **`320px`** | Small Mobile | Checkout Modal | 3-column City/State/PIN inputs compress | Stack City/State on row 1, PIN on row 2 (`grid-template-columns: 1fr`); PIN input $\ge 120\text{px}$ wide. |
| **`375px`** | iPhone SE (3rd) / Mini | PDP Hero | Image 460px high; Add to Bag off-screen | Constrain image height to 340px; title & price visible on load; sticky action bar activates on scroll. |
| **`375px`** | iPhone SE / Mini | Size Guide Modal | Table overflows horizontally without hint | Add smooth horizontal scroll container with gold fade shadow indicating swipeable columns. |
| **`390px`** | iPhone 14 / 15 Standard | Category Strip | Circles 64px; scroll lacks snap alignment | Add `scroll-snap-type: x mandatory` with `scroll-snap-align: start`; pill width 88px. |
| **`390px`** | iPhone 14 / 15 Standard | Cart Drawer | Quantity steppers close to right border | Add 16px right padding; ensure `+` and `−` buttons have $44 \times 44\text{px}$ touch target boxes. |
| **`430px`** | iPhone 15 Pro Max | Catalog Grid | Single 320px card floats with wide empty space | 2-column grid fills container (`repeat(2, 1fr)`) with 14px gap; card width ~192px; balanced margins. |
| **`768px`** | iPad Portrait | PDP Main Grid | Collapses to 1 column; image expands to 720px | Constrain image width to 480px centered, or maintain 2-column layout (`1fr 1fr`) with compact gap. |
| **`1024px`** | iPad Pro / Small Laptop | Catalog Grid | 2 columns in New Arrivals; 3 in main catalog | Standardize to unified 3-column grid (`repeat(3, 1fr)`); card width ~300px. |
| **`1440px`** | Desktop Standard | PDP Layout | Left image 650px wide $\times$ 890px high | Center-align gallery with max-width 500px; right column sticky at top 100px. |

---

## 4. Visual Card Hierarchy & Typography Balance

In addition to reducing image height, the card metadata must be restructured so the product does not look like an unformatted poster:

```
┌──────────────────────────────────────────────┐
│           [3:4 LUXURY IMAGE BOX]             │
│   - Subtle 1px gold border                   │
│   - Top-right: Small gold "SALE" or "NEW"    │
│   - Smooth hover crossfade to model pose 2   │
│   - Constrained height: max 240px (mobile)   │
├──────────────────────────────────────────────┤
│  WAAK ATELIER · SHERWANI                     │ <- Eyebrow: 9.5px, 0.18em tracking
│  The Ivory Zardozi Sherwani                  │ <- Serif title: 14px, 2-line max-height
│  ₹49,500  <span sale>₹55,000</span>          │ <- Price: 13.5px bold gold / charcoal
│  Sizes: 38 · 40 · 42 · 44                    │ <- Size chips: 10px subtle muted indicators
└──────────────────────────────────────────────┘
```

### Garment Image Integrity Safeguards
- **No Unnatural Cropping**: The focal point (`object-position`) is set to `center 15%` so royal collars, sherwani necklines, and turban crests are never cut off.
- **No Stretching**: Strict `object-fit: cover` with enforced aspect-ratio preserves native fabric weave proportions.
- **No Synthetic Placeholders**: Images use authentic high-resolution studio photography (`/assets/products/*.jpg`); fallback states display an elegant linen-textured monogram rather than generic clip-art.

---

## 5. Measurable Acceptance Criteria

1. **Card Proportions**: In all viewports $< 480\text{px}$, the catalog displays **2 cards per row**, with image height not exceeding $240\text{px}$.
2. **Above-the-Fold Visibility on Mobile PDP**: On a standard $390 \times 844\text{px}$ viewport, the product title, selling price, and size chips must be partially or fully visible without requiring user scroll.
3. **Touch Ergonomics**: All interactive elements (thumbnails, size buttons, quantity steppers, bag triggers) have minimum hit-box dimensions of $44 \times 44\text{px}$.
4. **Zero Overflow**: `document.documentElement.scrollWidth === window.innerWidth` verified at 320px, 375px, 390px, 430px, 768px, 1024px, and 1440px.
5. **No Layout Shift**: Image containers reserve exact aspect-ratio bounding boxes prior to image load (`aspect-ratio: 3/4`), achieving a Cumulative Layout Shift (CLS) score $< 0.05$.
