# WAAK — Backend LLM API Integration Decision Document

**Status**: Architectural Decision & Client Requirements Clarification  
**Current Codebase State**: **Zero AI/LLM code or external API dependencies exist**  
**Operating Boundary**: Implementation Strictly On Hold Pending Use-Case Sign-Off

---

## 1. The Core Clarifying Decision Required from Client

The client has confirmed interest in an "LLM API integration in the backend", but **the specific business objective and customer-facing functionality have not been defined.**

Before selecting a model provider, provisioning API keys, or writing backend endpoints, the client must answer this fundamental functional question:

> ### ❓ Primary Question for the Client:
> **“What exactly should the AI assistant do on the WAAK website: help customers choose outfits, answer product and policy questions, or handle another task?”**

---

## 2. Analysis of Candidate Use Cases & Trade-offs

| Candidate Use Case | Description & User Experience | Business Value | Privacy & Data Risk | Estimated Monthly API Cost |
| :--- | :--- | :--- | :---: | :---: |
| **Option A: Luxury Occasionwear Stylist** | Interactive chat widget helping customers choose garments based on wedding role (Groom, Groomsman, Father of Bride), ceremony (Sangeet, Mehendi, Reception), color themes, and time of day. | **High**: Drives conversion, increases average order value, guides patrons to correct silhouettes. | **Low**: Processes wedding preferences; zero personal patron or payment data required. | \$15 – \$40 / month (approx. 5,000 queries) |
| **Option B: Atelier Concierge & Policy Assistant** | Answers customer queries regarding sizing (inches vs UK/US), fabric care (zardozi, raw silk), delivery windows, and draft exchange policies using RAG over WAAK docs. | **Medium**: Reduces repetitive email support load; guides customers through PIN checks. | **Medium**: Must be strictly bounded to verified policies; hallucinations about return guarantees create legal liability. | \$10 – \$25 / month |
| **Option C: Internal Merchandising Admin Tool** | Backend-only tool in `/admin` enabling the atelier team to generate opulent editorial descriptions, fabric highlights, and SEO tags for new garments. | **Medium**: Speeds up catalog management for internal atelier staff. | **Very Low**: Not customer-facing; no public exposure or prompt injection surface. | \$5 – \$15 / month |

---

## 3. Strict Backend Architecture & Security Requirements

When the use case is authorized, implementation must strictly adhere to these 9 technical constraints:

### 1. Backend-Only Architecture
- Direct browser calls to LLM APIs (e.g. `api.openai.com` or `generativelanguage.googleapis.com`) are **strictly prohibited**.
- All requests must proxy through an authenticated Express route in the WAAK backend (e.g. `POST /api/ai/stylist`).
- The API key must never be bundled into Vite frontend code, `.env.local`, or client network payloads.

### 2. Credential Storage & Environment Separation
- Credentials stored strictly in `backend/.env` under `LLM_API_KEY` (or `GEMINI_API_KEY` / `OPENAI_API_KEY`).
- In staging/Docker environments, credentials must be passed via secure container secrets (`docker-compose.staging.yml`), never committed to Git.

### 3. Strict Input Validation & Prompt Injection Defense
- User prompt inputs must be validated, sanitized, and truncated:
  - Max length: 500 characters.
  - Stripped of control characters, HTML tags, and markdown injection.
- System prompt must enforce strict role boundaries:
  ```
  You are the WAAK Atelier Bridal & Groom Occasionwear Stylist.
  You ONLY answer questions relating to WAAK luxury Indian occasionwear, sherwanis, bandhgalas, kurta sets, color harmony, and styling etiquette.
  You must NEVER discuss competitor pricing, unapproved commercial return guarantees, or non-fashion topics.
  ```

### 4. Rate Limiting & Financial Cost Bounds
- Dedicated rate limiter: Max 5 LLM requests per minute per IP address.
- Global token cap: Daily spend limit hardcoded in backend (e.g. max \$5.00/day hard budget) to prevent automated denial-of-wallet attacks.
- Strict API timeout: 6.0 seconds max. If the upstream provider fails to respond within 6 seconds, abort and return a graceful fallback response.

### 5. Customer Data Minimization (DPDP Act Compliance)
- **Zero Personal Data Transmission**: Customer names, emails, addresses, credit card tokens, and order history must NEVER be passed into LLM prompt contexts.
- Only the user's fashion styling question and the public product catalog metadata may be sent.

### 6. Logging Restrictions
- Raw LLM conversation transcripts must not be permanently logged in plaintext with customer IP addresses.
- Error logs must sanitize API keys and authorization headers to avoid credential leakage in log aggregation tools.

### 7. Graceful Failure & Fallback Experience
- If the LLM provider experiences an outage (HTTP 429, 500, or timeout), the chat interface must not crash or display raw error traces.
- Fallback message:
  *"Our digital stylist is currently unavailable. Please contact our Flagship Concierge via WhatsApp or email at atelier@waak.in for immediate personalized assistance."*

### 8. Staging-Only Deployment & Mock Testing
- The initial rollout must be gated behind an environment flag: `ENABLE_AI_STYLIST=true`.
- Test suites must use mocked LLM responses (`mockAiProvider`) to prevent draining API credits during automated CI/CD runs.

---

## 4. Next Step
Present the clarifying question in **Section 1** to the client. Keep all LLM coding on hold until their functional intent and budget are confirmed.
