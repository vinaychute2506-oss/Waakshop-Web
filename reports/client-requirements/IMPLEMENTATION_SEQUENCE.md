# WAAK — Client Requirements Implementation Sequence & Roadmap

**Current Operating State**: Controlled Staging Only · Phase 4.0 on Hold  
**Prerequisite**: Review and approval of `reports/client-requirements/` deliverables  
**Git Baseline**: Preserving tag `waak-v3.1-client-preview` at `097dfb1`

---

## 1. Phased Execution Roadmap

To prevent code regressions and maintain rigorous testing across the storefront, implementation must proceed in 4 strictly ordered steps:

```
┌────────────────────────────────────────────────────────────────────────┐
│               WAAK CLIENT REQUIREMENTS EXECUTION ORDER                 │
└────────────────────────────────────────────────────────────────────────┘
     │
     ▼
[STEP 1: Client Requirements Sign-Off]  <-- WE ARE HERE
     │ - Deliverable: Register, Audit & Decision Reports in reports/client-requirements/
     │ - Obtain client confirmation on LLM functional use case
     │ - Obtain client's verified WhatsApp business telephone number
     │
     ▼
[STEP 2: Product Image Sizing & Mobile Responsiveness]
     │ - Refactor Home.css to 2-column mobile catalog grid (repeat(2, 1fr))
     │ - Adjust catalog image aspect ratio from 3:4.3 to 3:4 (reduces height by ~100px)
     │ - Cap PDP desktop gallery height at 620px (above-the-fold visibility)
     │ - Implement fluid responsive spacing and zero-overflow layout across 320px–1440px
     │ - Verify with visual regression tests and mobile device recordings
     │
     ▼
[STEP 3: Trust Presentation, Exchanges & WhatsApp Action]
     │ - Add verified trust reassurance cues to CheckoutModal (Razorpay, HMAC, stock lock)
     │ - Elevate 7-day exchange guidance on PDP while retaining legal draft disclaimers
     │ - Wire WhatsApp floating button and PDP inquiry trigger with non-sensitive prefilled copy
     │ - Run full commerce & policy regression suite (325+ assertions)
     │
     ▼
[STEP 4: Backend LLM API Integration (Controlled Staging)]
     │ - Provision approved provider API credentials in backend/.env
     │ - Build backend-only proxy endpoint with input sanitization and 5 req/min rate limiter
     │ - Implement graceful fallback experience for API timeouts or service disruptions
     │ - Test against mocked staging payloads before enabling feature toggle
```

---

## 2. Detailed Task Breakdown & Verification Gates

### Step 1: Requirements Sign-off & Client Inquiry (Current Step)
- **Actions**:
  1. Present the Requirements Register (`CLIENT_REQUIREMENTS_REGISTER.md`) and Architectural Audits.
  2. Ask the client clarifying question regarding the LLM assistant's functional scope.
  3. Request the verified WhatsApp Business account number from the client.
- **Verification Gate**: No code changes to application behavior during this step.

### Step 2: Product Image Sizing & Mobile Responsiveness
- **Target Files**: `src/Home.css`, `src/ProductDetail.tsx`, `src/components/Navbar.css`, `src/components/CartDrawer.tsx`.
- **Key Changes**:
  - Update `.new-arrival-image-box` and `.product-card-standard` from `aspect-ratio: 3 / 4.3` to `aspect-ratio: 3 / 4`.
  - Replace `grid-template-columns: 1fr; max-width: 320px;` with `grid-template-columns: repeat(2, 1fr); gap: 12px;` in `@media (max-width: 480px)`.
  - Constrain `.pdp-main-image-wrap` max-height to `620px` on desktop and `360px` on mobile.
  - Implement horizontal scroll-snap on category pills and mobile thumbnails.
- **Test Plan**:
  - Test responsive rendering across 320px, 375px, 390px, 430px, 768px, 1024px, and 1440px using Chrome CDP emulation.
  - Record mobile walkthrough video showing balanced 2-column mobile grid.

### Step 3: Customer Trust, Exchanges & WhatsApp Action
- **Target Files**: `src/components/CheckoutModal.tsx`, `src/ProductDetail.tsx`, `src/components/PolicyView.tsx`, `src/components/WhatsAppButton.tsx` (new component).
- **Key Changes**:
  - Add verified security badge to CheckoutModal: *"Official Razorpay Payment Gateway · Server-Verified Order Signature"*.
  - Add 7-Day Exchange quick-reference link on PDP below size chips, linking directly to `/returns-and-exchanges`.
  - Create `WhatsAppButton` component that checks `import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER`.
  - If number exists, render floating concierge trigger and PDP "Inquire via WhatsApp" button.
- **Test Plan**:
  - Execute 325-assertion regression suite (`scratch/run_all_tests.mjs`).
  - Verify WhatsApp button generates valid `https://wa.me/` URLs without customer personal data.
  - Verify Razorpay payment flow remains locked in test mode.

### Step 4: Backend LLM Integration (Controlled Staging)
- **Target Files**: `backend/src/routes/ai.ts` (new), `backend/src/config.ts`, `backend/src/middleware/rateLimiter.ts`, `src/components/StylistChat.tsx` (new).
- **Key Changes**:
  - Add `LLM_API_KEY` to `backend/src/config.ts` (backend only).
  - Create secure `POST /api/ai/stylist` endpoint with 500-character input validation and 5 req/min rate limit.
  - Integrate approved provider (e.g. Gemini / OpenAI) with strict fashion-only system prompt.
  - Add client-side chat interface with graceful error fallback.
- **Test Plan**:
  - Test input validation and prompt injection defenses with adversarial payloads.
  - Test rate limiting (HTTP 429 after 5 requests).
  - Test timeout fallback (simulated 6-second delay).
  - Verify zero customer personal data is included in AI requests.

---

## 3. Approval & Stop Criteria

1. **Stop Condition**: Stop after presenting this implementation sequence and the client requirements reports.
2. **Phase 4.0 Condition**: Do not begin Phase 4.0 courier or live payment integrations.
3. **Authorization Required**: Await user and client sign-off on:
   - Visual image sizing plan (`PRODUCT_IMAGE_AND_RESPONSIVE_PLAN.md`).
   - WhatsApp business number availability.
   - LLM use-case selection.
