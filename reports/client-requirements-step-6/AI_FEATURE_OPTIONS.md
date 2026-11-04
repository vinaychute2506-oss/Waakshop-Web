# WAAK — Step 6: AI Feature Options & Architecture Planning
## Strategic Options Evaluation & Trade-off Analysis

**Document Reference**: `reports/client-requirements-step-6/AI_FEATURE_OPTIONS.md`  
**Planning Status**: Planning & Documentation Only (Zero Application Modification)  
**Execution Environment**: Controlled Staging Only  
**Branch**: `feature/client-req-step-6-ai-planning`  
**Anchor Baseline**: `waak-v3.1-client-preview` (`097dfb1` / `ae75687`)  
**Production Status**: **STRICTLY ON HOLD** · Payment Sandbox: **Razorpay TEST Mode Only**  
**AI Integration Status**: **NO PROVIDER CONNECTED · ZERO LIVE API CREDITS CONSUMED**

---

### 1. Executive Summary

This proposal outlines the strategic options, technical requirements, cost estimates, and risk boundaries for introducing Artificial Intelligence (AI) features to the **WAAK** occasionwear platform.

Rather than implementing a generic, unconstrained chatbot that poses reputational, pricing, and hallucination risks, this document evaluates **three tightly scoped, high-value AI capabilities** tailored specifically to the luxury Indian menswear and occasionwear market.

#### Core Planning Principles
1. **Zero Premature Code or Cost**: No external AI SDKs (OpenAI, Anthropic, Google Gemini) have been installed, no API keys generated, and no billing credits consumed.
2. **Deterministic-First Strategy**: We recommend deploying a deterministic, catalog-grounded filtering experience first (Stage 1) before introducing any external Large Language Model (Stage 2).
3. **Absolute Data Privacy**: Customer PII, shipping addresses, payment details, session tokens, and order histories are strictly excluded from all AI data flows.
4. **Authoritative Backend Primacy**: AI responses are strictly informational. An AI feature can **never** alter prices, modify inventory, authorize refunds, alter orders, or override approved policies.

---

### 2. Detailed Evaluation of the Three Use Cases

```
                                  +---------------------------------------------+
                                  |         WAAK AI Feature Candidates          |
                                  +---------------------------------------------+
                                                         |
         +-----------------------------------------------+-----------------------------------------------+
         |                                               |                                               |
         v                                               v                                               v
+-----------------------------+                 +-----------------------------+                 +-----------------------------+
|          OPTION A           |                 |          OPTION B           |                 |          OPTION C           |
|      AI Style Concierge     |                 |  Conversational Discovery   |                 |   Customer Support Ass't    |
+-----------------------------+                 +-----------------------------+                 +-----------------------------+
| - Occasion-based styling    |                 | - Natural language search   |                 | - Policy Q&A (Care, Sizing) |
| - Color/silhouette curation |                 | - Semantic-to-filter mapping|                 | - Shipping timelines        |
| - Wardrobe harmonization    |                 | - Budget-bounded queries    |                 | - FAQ assistance            |
| - Stage 1: Deterministic    |                 | - Zero hallucinated items   |                 | - Strictly approved content |
+-----------------------------+                 +-----------------------------+                 +-----------------------------+
```

---

#### Option A — AI Style Concierge *(Recommended to Evaluate First)*

* **Concept**: A digital atelier stylist that guides clients through selecting occasionwear based on event type (e.g., Sangeet, Reception, Cocktail, Traditional Wedding), time of day, venue type, color palette preferences, and silhouette fit (Sherwani, Bandhgala, Indo-Western, Kurta Set).
* **User Experience**:
  * Step-by-step interactive style questionnaire (or natural conversation).
  * Curates 2 to 4 matching outfits from the live WAAK catalog.
  * Suggests styling pairings (e.g., styling an Ivory Sherwani with a velvet stole and coordinated mojaris).
* **Authoritative Data Sources**:
  * `products.category`, `products.occasion`, `products.fabric`, `products.price`, `product_variants.size`, `product_variants.stock_quantity`.
* **Privacy & Isolation**:
  * Operates on ephemeral session state.
  * No account creation, login, or identity information required.
  * Preferences discarded upon session close or stored only in local browser `sessionStorage`.
* **Risk Profile**: Low. Style advice is aesthetic; bounding suggestions to verified catalog items prevents fabric or inventory hallucinations.

---

#### Option B — Conversational Product Discovery

* **Concept**: A natural-language search bar replacing or augmenting conventional keyword search. Allows shoppers to submit free-form requests such as:
  * *"Show me a deep burgundy outfit for an evening winter reception under ₹60,000"*
  * *"I need a raw silk kurta set in size 42 for a Haldi ceremony"*
* **User Experience**:
  * Input field parses intent, extracting: `occasion: "Reception"`, `color: "burgundy"`, `price_max: 60000`, `category: "all"`.
  * Queries the PostgreSQL database directly using structured filters.
  * Displays standard, responsive WAAK product cards with live inventory and pricing.
* **Authoritative Data Sources**:
  * Full-text search over PostgreSQL `products` and `product_variants` tables.
* **Privacy & Isolation**:
  * Query string only. Zero customer PII or transaction history transmitted.
* **Risk Profile**: Medium-Low. The primary risk is user frustration if a search query fails to match available stock; mitigated by displaying nearest fallback products.

---

#### Option C — Customer Support Assistant

* **Concept**: An automated concierge addressing customer inquiries regarding garment care, size guides, custom measurements, dispatch schedules, and policy rules.
* **User Experience**:
  * Chat modal offering quick-prompt chips (*"How do I choose my sherwani size?"*, *"What are your dispatch timelines?"*, *"How should I store raw silk?"*).
  * Direct links to [`/shipping-policy`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/src/components/PolicyView.tsx) and [`/care-and-preservation`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/src/components/PolicyView.tsx).
* **Authoritative Data Sources**:
  * Hardcoded, approved policy markdown files in `src/components/PolicyView.tsx`.
* **Critical Governance Blocker**:
  * **Exchange Policy Dependency**: Because the commercial returns and exchange terms remain in **Draft Status** pending client written approval ([`Step 4 Decision Brief`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/reports/client-requirements-step-4/EXCHANGE_POLICY_DECISION_BRIEF.md)), an automated support assistant **must not** make claims regarding return windows, reverse shipping costs, or refund eligibility.
* **Risk Profile**: High (until policies are formally approved). Inaccurate statements regarding returns create consumer liability under Indian Consumer Protection (E-Commerce) Rules, 2020.

---

### 3. Multi-Dimensional Comparison Matrix

| Evaluation Dimension | Option A: AI Style Concierge | Option B: Conversational Discovery | Option C: Customer Support Assistant |
| :--- | :--- | :--- | :--- |
| **Brand Alignment** | **Exceptional** (Matches luxury haute-couture personal shopping) | **Strong** (Modern, efficient commerce navigation) | **Moderate** (Useful, but feels utilitarian/call-center) |
| **Business Value** | High (Drives average order value, cross-styling, and gift purchases) | High (Reduces search bounce rate and speeds checkout) | Moderate (Deflects repetitive inquiries; limited revenue lift) |
| **Customer Experience** | Engaging, consultative, visual, and personalized | Fast, direct, frictionless product finding | Quick FAQ resolution; risk of scripted responses |
| **Technical Complexity** | Moderate (Deterministic rule engine or lightweight LLM) | Moderate-High (Natural Language Intent $\rightarrow$ SQL Translation) | Moderate (RAG pipeline over approved policy documents) |
| **Estimated Dev Effort** | **2–3 weeks** (Stage 1 deterministic prototype: 1 week) | **2–3 weeks** (Query parser + catalog filter integration) | **3–4 weeks** (Requires policy sign-off + guardrail tuning) |
| **Estimated Recurring Cost** *(Assumptions below)* | **₹0** (Stage 1) / **₹150–₹750 / mo** (Stage 2 LLM at 2,000 sessions) | **₹0** (Rule-based) / **₹100–₹500 / mo** (LLM extraction) | **₹150–₹600 / mo** (LLM Q&A embedding & inference) |
| **Data Privacy Impact** | **Zero PII** (Session-only styling parameters) | **Zero PII** (Anonymous search queries) | **Low-Medium** (Customers may inadvertently paste personal details) |
| **Authoritative Sources** | PostgreSQL `products`, `variants`, and curated style tags | PostgreSQL catalog records, price columns, and stock | Approved policy text in [`PolicyView.tsx`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/src/components/PolicyView.tsx) |
| **Operational Risk** | Minor (Subjective style opinion; catalog items always real) | Low (Failed search fallback to catalog grid) | **High** (Risk of misrepresenting unapproved exchange policies) |
| **Client Policy Dependency** | **None** (Operates independently of return/exchange policies) | **None** (Operates independently of commercial policies) | **Blocked** (Strictly blocked pending Step 4 client decisions) |
| **Recommended Milestone** | **Milestone 1 (Priority Candidate)** | Milestone 2 (Future Search Upgrade) | Milestone 3 (Post-Policy Approval Only) |

*Cost Estimate Methodology & Pricing Assumptions (as of November 2026):*
* Estimates assume server-side proxy using a lightweight, state-of-the-art model (e.g. OpenAI GPT-4o-mini at \$0.15/1M input and \$0.60/1M output tokens, or Google Gemini 1.5 Flash at \$0.075/1M input and \$0.30/1M output tokens).
* Average conversation length: 4 turns (~1,500 prompt tokens, ~500 completion tokens per session).
* At 2,000 monthly sessions: $\approx 3\text{M input tokens} \times \$0.15 + 1\text{M output tokens} \times \$0.60 = \$0.45 + \$0.60 = \$1.05\text{ USD } (\approx ₹90\text{ INR})$. With 100% margin buffer for re-tries and system prompts: **$\approx ₹180\text{ INR / month}$**.
* **Stage 1 Deterministic Engine**: **₹0.00 / month** (zero external API calls).

---

### 4. Recommended Strategic Direction

We recommend prioritizing **Option A: AI Style Concierge**, executed through a two-stage roadmap:

```
+-------------------------------------------------------------+
| Stage 1: Deterministic Atelier Stylist (Immediate / Zero-Risk)|
| - Implemented as an interactive UI modal inside React.     |
| - Filters WAAK catalog based on Occasion, Color, Budget.    |
| - Uses local rules and catalog queries.                     |
| - Cost: ₹0 API fees. Privacy: 100% in-browser. Zero LLM risks.|
+-------------------------------------------------------------+
                              |
                              v (Client review and written authorization)
+-------------------------------------------------------------+
| Stage 2: Optional Server-Mediated LLM Styling Advisor      |
| - Backend Express proxy handles prompt templates.           |
| - Enriches style rationale ("Velvet Bandhgala pairs with...")|
| - Hard spending limits and emergency kill-switch.           |
| - Strictly bounded to real database product IDs.            |
+-------------------------------------------------------------+
```

#### Why Option A is Optimal for WAAK:
1. **Strengthens Luxury Positioning**: High-end Indian groom and groomsmen shopping is fundamentally consultative. Clients rarely buy by keyword; they buy by occasion, wedding theme, and dress code.
2. **Decoupled from Commercial Policy Blockers**: Unlike customer support chatbots, the Style Concierge does not touch return windows, courier costs, or refunds.
3. **Stage 1 Delivers Immediate Value at Zero Cost**: A deterministic wizard provides 80% of the customer utility with zero recurring API costs and zero risk of hallucination.

---

### 5. Client Decisions Required Before Implementation

The brand owners must formally select and authorize the following before any technical development begins:

1. **Feature Direction**:
   * Approve **Option A (Style Concierge)**, **Option B (Conversational Search)**, **Option C (Support Assistant)**, or **Decline/Defer AI completely**.
2. **Implementation Phasing**:
   * Authorize **Stage 1 (Deterministic Prototype)** first, or skip directly to external LLM evaluation.
3. **Provider Preference (for Stage 2)**:
   * Select approved AI provider (OpenAI, Google Cloud Vertex / Gemini, Anthropic, or AWS Bedrock) based on data sovereignty requirements.
4. **Monthly Spending Limit**:
   * Approve a hard monthly budget cap (e.g., \$15.00 / ₹1,250 INR/month) with automated billing alerts.
5. **Brand Tone & Persona**:
   * Confirm stylistic voice (e.g. *"Atelier WAAK Royal Stylist"* vs concise, modern informational assistance).

---

### 6. Explicit Out-of-Scope Items

To preserve platform security, the following capabilities are **permanently excluded** from any WAAK AI feature:

* ❌ **No Transactional Mutations**: The AI cannot alter product prices, discount cart totals, apply unverified promo codes, or modify inventory quantities.
* ❌ **No Autonomous Actions**: The AI cannot place orders, cancel orders, process payments, or initiate refunds.
* ❌ **No Customer PII Access**: The AI cannot read, inspect, or query user passwords, customer addresses, phone numbers, or credit card details.
* ❌ **No Direct Client-to-Provider Connections**: Browser client code will **never** hold or expose third-party AI API keys.
* ❌ **No Overriding Approved Terms**: The AI cannot contradict WAAK legal policies or make commercial promises not published on the website.
