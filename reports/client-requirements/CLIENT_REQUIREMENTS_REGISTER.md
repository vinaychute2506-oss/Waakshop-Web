# WAAK — Client Requirements Register

**Status**: Baseline Draft for Review & Sign-Off  
**Operating State**: Controlled Staging Only · Phase 4.0 on Hold  
**Source**: WhatsApp Client Feedback Review (November 2026)  
**Git Baseline**: Commit `a0cb1cf` (Preserves tag `waak-v3.1-client-preview` at `097dfb1`)

---

## Executive Requirements Matrix

| ID | Priority | Client Request | Current State | Proposed Remediation | Approval Status |
| :--- | :---: | :--- | :--- | :--- | :---: |
| **REQ-01** | **P1** | **Product photos look too big** | Cards use tall aspect ratios (3:4.3 on homepage, 3:4.1 on PDP). Single-column mobile cards reach ~470px height. | Rebalance to compact luxury ratio (3:4 or 4:5), 2-column mobile catalog grid, constrained PDP desktop hero height. | Pending Design Sign-off |
| **REQ-02** | **P1** | **Mobile-friendly layout** | Single-column collapse under 480px causes vertical fatigue; fixed paddings; wide tables on policy pages. | Implement fluid mobile design across 320px–430px, horizontal scroll cards/carousels, responsive tables, touch targets $\ge 44\text{px}$. | Pending Verification |
| **REQ-03** | **P1** | **Secure checkout and customer trust** | Technical protections exist in code (HMAC verify, atomic stock decrement), but UI trust cues are generic. | Add verified trust cues to CheckoutModal and PDP without claiming unverified certifications or guarantees. | Technical Ready / Copy Review |
| **REQ-04** | **P1** | **Easy exchanges** | `/returns-and-exchanges` is implemented with prominent draft disclaimer; PDP references are present. | Elevate exchange visibility on PDP and cart; obtain business sign-off on return window, exclusions, and shipping costs. | Blocked on Business Terms |
| **REQ-05** | **P1** | **WhatsApp for more details** | Policy text states line allocation is pending. No active `wa.me` links or button exists in UI. | Implement floating atelier concierge button and PDP inquiry trigger with non-sensitive prefilled message; blocked until number provided. | Blocked on Business Number |
| **REQ-06** | **P2** | **LLM API integration in backend** | Zero AI/LLM code or dependencies in backend. Functionality and use case remain unspecified by client. | Define functional specification (outfit stylist vs FAQ bot vs admin tool); establish privacy guardrails and provider credentials. | Blocked on Client Decision |

---

## Detailed Requirement Specifications

### REQ-01: Product Photo Sizing & Visual Hierarchy
- **Client Request**: "Product photos look too big."
- **Current Implementation & Evidence**:
  - `src/Home.css:489`: `.new-arrival-image-box { aspect-ratio: 3 / 4.3; }`
  - `src/Home.css:1074`: `@media (max-width: 480px) { .new-arrivals-grid { grid-template-columns: 1fr; max-width: 320px; } }`
  - `src/ProductDetail.tsx:1121`: `.pdp-main-image-wrap { aspect-ratio: 3 / 4.1; }`
  - *Finding*: Under 480px, each product card occupies a full single column at 320px wide by 460px high, dominating the viewport and requiring excessive scrolling. On PDP, desktop left-column image expands to 650px wide by 890px high.
- **Proposed Change**:
  - Rebalance catalog cards to a standard luxury portrait ratio: `3 / 4` (0.75) or `4 / 5` (0.80).
  - Adopt a balanced 2-column grid on mobile screens (`repeat(2, 1fr)`) with 12px gaps.
  - Constrain PDP desktop gallery max-height to `620px` with `object-fit: cover`.
  - Balance typography: ensure product title, occasion tag, selling price, and size chips are immediately visible without scrolling.
- **Acceptance Criteria**:
  - Catalog cards display 2 per row on mobile viewports (360px–430px).
  - On desktop (1440px), product images do not exceed `520px` viewport height.
  - No stretching, distortion, or unnatural cropping of necklines, borders, or hem embroidery.
- **Dependencies**: Frontend CSS refactor (`Home.css`, `ProductDetail.tsx`).
- **Business Approval Needed**: Visual preview approval by client.

---

### REQ-02: End-to-End Mobile Responsiveness
- **Client Request**: "The layout is not mobile-friendly."
- **Current Implementation & Evidence**:
  - Tested across 320px, 375px, 390px, 430px viewports.
  - *Finding 1*: Category scroll pills lack smooth momentum scroll snap and overflow cleanly on 320px.
  - *Finding 2*: PDP main image pushes size selector and "Add to Bag" below the initial screen fold on 390x844 viewports.
  - *Finding 3*: Policy view measurement and delivery comparison tables horizontally scroll without a visual scroll cue on narrow screens.
  - *Finding 4*: Checkout modal overlay padding causes input fields to pinch on 320px screens.
- **Proposed Change**:
  - Implement fluid responsive typography and spacing using CSS `clamp()`.
  - Enable CSS scroll-snap on category pills and mobile gallery thumbnails (`scroll-snap-type: x mandatory`).
  - Optimize PDP mobile hierarchy: compact image (max 340px height on mobile) so title, price, and primary action are visible within the first 1.5 screen viewports.
  - Ensure all interactive touch targets meet WCAG 2.1 AAA minimum standard ($\ge 44 \times 44\text{px}$).
- **Acceptance Criteria**:
  - Zero horizontal body overflow (`overflow-x: hidden` verified at 320px width).
  - All buttons and interactive pills have $\ge 44\text{px}$ touch target height.
  - Sticky bottom action bar on PDP remains thumb-accessible with iOS safe-area inset support (`env(safe-area-inset-bottom)`).
- **Dependencies**: `Home.css`, `Navbar.css`, `ProductDetail.tsx`, `CheckoutModal.tsx`, `PolicyView.tsx`.
- **Business Approval Needed**: Device walkthrough video review.

---

### REQ-03: Secure Checkout & Customer Trust Presentation
- **Client Request**: "Add secure checkout ... to improve customer trust."
- **Current Implementation & Evidence**:
  - Backend already implements:
    1. Server-authoritative pricing (ignores client-submitted amounts).
    2. PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) preventing overselling under concurrency.
    3. Razorpay cryptographic HMAC-SHA256 signature verification.
    4. Webhook replay idempotency guard.
    5. Cross-customer data isolation (`HTTP 403 Forbidden` on unauthorized cart/order/address access).
    6. Runtime key guard blocking `rzp_live_*` in development/staging.
  - Storefront UI currently only displays: `"🔒 256-bit encrypted checkout with server-side HMAC signature verification"`.
- **Proposed Change**:
  - Enhance checkout trust cues with concrete, verified technical assurances:
    - `"Official Razorpay Sandbox Gateway — PCI-DSS Compliant Infrastructure"`
    - `"Server-Verified Cryptographic Order Signature"`
    - `"Real-Time Atelier Inventory Allocation"`
    - Explicit Indian PIN code delivery verification badge.
  - Add visual trust icon row (Shield, Lock, Card, Verification) to CheckoutModal and PDP under Add to Bag.
  - *Constraint*: Do not claim unverified external certifications (e.g. "ISO 27001 Certified Atelier", "Insured Air Cargo Guarantee") until commercially underwritten.
- **Acceptance Criteria**:
  - Trust indicators appear in CheckoutModal above submit button.
  - Payment simulation remains strictly in TEST mode.
  - Order confirmation screen displays authoritative order reference (`WAAK-2026-XXXX`).
- **Dependencies**: `CheckoutModal.tsx`, `ProductDetail.tsx`.
- **Business Approval Needed**: Trust copy approval.

---

### REQ-04: Easy Exchanges & Policy Accessibility
- **Client Request**: "Add ... easy exchanges to improve customer trust."
- **Current Implementation & Evidence**:
  - Policy page `/returns-and-exchanges` is active, routed, and linked in footer (`PolicyView.tsx:293-350`).
  - Mentions 7-day exchange window, master-tailor adjustment for bespoke fits, and concierge reverse pickup.
  - All policy text currently bears the mandatory legal review warning banner: `"Legal & Business Review Status: Unapproved Draft Policy (Pending Corporate Confirmation)"`.
- **Proposed Change**:
  - Add prominent "7-Day Atelier Exchange" trust cue on PDP directly beneath the size selector.
  - Add an inline "Exchange & Alteration Policy" accordion or link on PDP that opens the policy without losing cart or configuration state.
  - Retain the draft disclaimer until the business confirms the commercial terms.
- **Acceptance Criteria**:
  - Exchange terms accessible from PDP in 1 click.
  - Draft policy disclaimer remains visible to avoid premature legal liability.
- **Dependencies**: `ProductDetail.tsx`, `PolicyView.tsx`.
- **Business Approval Needed**: Executive sign-off on return window, exclusion list, and shipping fees.

---

### REQ-05: Verified WhatsApp Concierge Contact
- **Client Request**: "Add WhatsApp for customers who need more details."
- **Current Implementation & Evidence**:
  - `src/components/PolicyView.tsx:451` states: `"Direct WhatsApp & Telephonic Line: Dedicated line allocation pending commercial carrier provisioning."`
  - No active WhatsApp floating button or click-to-chat links exist in the codebase.
- **Proposed Change**:
  - Design a discreet luxury floating concierge button (bottom-right above sticky bar, gold emblem, WhatsApp icon).
  - Add a secondary "Inquire via WhatsApp" button on PDP under "Add to Bag".
  - Construct pre-filled inquiry message:
    `"Hello WAAK Atelier, I am interested in inquiring about [Product Name] (SKU: [SKU]). Could you please assist me with sizing and availability?"`
  - *Hard Blocker*: Feature must use an environment variable `VITE_WHATSAPP_BUSINESS_NUMBER`. If the variable is unset or placeholder, the button is hidden or displays a "Consultation by Appointment" modal.
- **Acceptance Criteria**:
  - Clicking WhatsApp button opens `https://wa.me/<number>?text=...` in new window.
  - No customer personal data (passwords, payment details, addresses) is ever included in the URL query string.
  - Works responsively across mobile (launches WhatsApp app) and desktop (launches WhatsApp Web).
- **Dependencies**: Client to provide verified business phone number.
- **Business Approval Needed**: Verified Indian WhatsApp Business Account number (+91).

---

### REQ-06: LLM API Backend Integration Planning
- **Client Request**: "Integrate an LLM API in the backend."
- **Current Implementation & Evidence**:
  - Zero LLM libraries, API clients, or routes exist in `backend/` or `src/`.
  - The client agreed with the suggestion, but the functional scope is undefined.
- **Proposed Action (Planning Only)**:
  - Do NOT implement code in this phase.
  - Formulate a clear decision matrix with 3 candidate architectures:
    1. *Occasionwear Styling Assistant* (Recommends sherwanis/kurtas based on wedding event, role, time of day).
    2. *Atelier Concierge / FAQ Assistant* (Answers sizing, care, dispatch, and policy questions).
    3. *Admin Merchandising Assistant* (Internal tooling for generating luxury product descriptions).
  - Present the exact clarifying question to the client before selecting an API provider or designing prompts.
- **Acceptance Criteria**:
  - Comprehensive decision document produced (`LLM_INTEGRATION_DECISION.md`).
  - Zero unapproved external API dependencies added to codebase.
- **Dependencies**: Client functional decision, API key provision, security architecture approval.
- **Business Approval Needed**: Feature use case, AI budget/token limit, privacy disclosure sign-off.
