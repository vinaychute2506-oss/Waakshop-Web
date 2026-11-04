# WAAK — AI Feature Decision Brief
## For Client Review & Formal Business Authorization

**Document Reference**: `reports/client-requirements-step-6/AI_CLIENT_DECISION_BRIEF.md`  
**Purpose**: Enable brand leadership to choose whether, when, and how to introduce AI features to WAAK.  
**Current Status**: Proposal Only · Pending Written Authorization  
**Current Environment**: Controlled Staging Only  
**Important Notice**: No AI provider has been connected, no API fees have been incurred, and no code has been changed.

---

### Executive Overview

As part of the ongoing refinement of the WAAK occasionwear platform, we have evaluated how Artificial Intelligence could be integrated into the customer experience. 

Rather than deploying an untargeted chatbot that risks making unauthorized promises about pricing, returns, or delivery dates, we have designed three safe, premium options.

Our primary recommendation is **Option A (AI Style Concierge)** starting with **Stage 1 (a zero-cost, deterministic styling guide)**, which enhances personal shopping without external API dependencies or recurring costs.

---

### The Three Strategic Options

#### Option A: Atelier AI Style Concierge *(Recommended)*
* **What it does**: Acts as a digital personal stylist. Shoppers select or describe their upcoming event (e.g., Wedding, Reception, Haldi, Cocktail), preferred colors, and budget. The concierge recommends curated outfits directly from the WAAK catalog.
* **Why it fits WAAK**: High-end Indian occasionwear is consultative. Grooms and wedding guests value styling advice on garment coordination, color harmony, and event etiquette.
* **Cost**:
  * **Stage 1 (Deterministic Prototype)**: **₹0 / month** (Runs entirely on existing website code).
  * **Stage 2 (AI-Enriched Language Model)**: Estimated **₹150 to ₹600 / month** (depending on traffic).
* **Privacy**: High. Operates purely on style preferences within the session. No user account, name, or phone number is shared with an AI service.

---

#### Option B: Conversational Product Discovery
* **What it does**: Allows customers to type naturally in the search bar, such as *"Show me velvet bandhgalas under ₹55,000 for an evening reception"*, and automatically translates that request into verified catalog filters.
* **Why it fits WAAK**: Provides a smooth shopping experience for customers who know what they want but do not want to click through multiple filter dropdowns.
* **Cost**: Estimated **₹100 to ₹450 / month** if powered by an external language model.
* **Privacy**: High. Only search terms are processed.

---

#### Option C: Customer Support Assistant *(Currently Blocked)*
* **What it does**: Answers common questions regarding fabric care, sizing guides, and shipping timelines.
* **Current Blocker**: **Commercial Returns & Exchanges policies remain in draft status** ([Step 4 Decision Brief](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/reports/client-requirements-step-4/EXCHANGE_POLICY_DECISION_BRIEF.md)). An AI assistant **must not** guess return periods, reverse courier fees, or refund terms until you formally approve them in writing.
* **Recommendation**: Defer Option C until the brand owners finalize and approve commercial terms.

---

### Summary Comparison for Decision Making

| Option | Primary Benefit | Recurring Cost | Privacy Risk | Dependencies | Recommendation |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Option A: Style Concierge** | Elevates luxury brand feel; drives outfit discovery | **₹0 (Stage 1)** / ~₹300/mo (Stage 2) | Negligible | None | **Recommended to prioritize** |
| **Option B: Smart Search** | Speeds up catalog discovery | ~₹250/mo | Negligible | Catalog attributes | Viable alternative |
| **Option C: Support Assistant** | Answers sizing & policy FAQs | ~₹300/mo | Low-Medium | **Blocked on Step 4 Policy approval** | **Defer until policies finalized** |
| **Option D: Decline / Defer** | Zero complexity; relies on manual WhatsApp concierge | **₹0** | None | Requires WhatsApp number (Step 5) | Safe baseline |

---

### Absolute Platform Guardrails

Regardless of which option you select, the following safety controls are permanently enforced:

1. **No Price or Stock Tampering**: The AI **cannot** discount prices, apply unapproved coupons, modify inventory, or invent items that do not exist in the database.
2. **No Order or Payment Execution**: The AI **cannot** place orders, charge cards, cancel purchases, or issue refunds.
3. **No Customer PII Access**: The AI never receives customer names, passwords, phone numbers, delivery addresses, or credit card details.
4. **Instant Kill-Switch**: Management can instantly disable any AI feature with a single configuration switch (`ENABLE_AI_ASSISTANT=false`) without bringing down the store.

---

### Client Authorization & Selection Form

Please indicate your preferred direction by returning the signed or acknowledged choices below:

#### 1. Feature Selection *(Select one)*
* [ ] **Option A1: Approve Stage 1 Style Concierge (Deterministic / Zero-Cost Prototype)** — *Recommended*
* [ ] **Option A2: Authorize Style Concierge with External AI Language Model (Stage 2)**
* [ ] **Option B: Authorize Conversational Search Discovery**
* [ ] **Option C: Authorize Customer Support Assistant (Only after approving Step 4 Return Policies)**
* [ ] **Option D: Decline all AI features for now** (Rely exclusively on direct human WhatsApp concierge)

#### 2. Monthly Budget Hard-Cap *(If selecting an external AI model)*
* [ ] **₹1,000 INR / month (~$12 USD)**
* [ ] **₹2,500 INR / month (~$30 USD)**
* [ ] **Custom limit**: ₹____________ / month

#### 3. Preferred AI Provider *(If selecting an external AI model)*
* [ ] **Google Cloud Vertex AI / Gemini** (Strong enterprise data residency)
* [ ] **OpenAI (GPT-4o-mini)** (High-efficiency, low-latency)
* [ ] **Anthropic (Claude 3.5 Haiku)** (Strict constitutional safety guardrails)
* [ ] **Developer Recommendation** (Let technical team select the most cost-effective option)

---

**Client Authorization Sign-off**

**Authorized Representative Name**: ___________________________________________  
**Title / Role**: ___________________________________________________________  
**Date of Decision**: _______________________________________________________  
**Written Confirmation**: `[ APPROVED / DEFERRED / DECLINED ]`
