# WAAK Atelier — BodhX AI Assistant Configuration & Knowledge Architecture

**Document Reference**: `WAAK-STEP-8-BODHX-KNOWLEDGE-CONFIG`  
**Target Platform**: BodhX AI (`https://bodhx.ai`)  
**Account Profile**: Ankur – Admin (WAAK Atelier)  
**Security Classification**: Confidential · Internal Staging Architecture  
**Status**: Staging Scaffold Complete · Awaiting Client Knowledge Provision & Token Regeneration  

---

## 1. Executive Summary & Purpose

This document outlines the operational knowledge base structure, training data boundaries, and response guardrails required before activating the **BodhX AI Shopping Assistant** on the public-facing WAAK luxury occasionwear storefront.

The client has supplied the official BodhX embed script:
```html
<script 
  src="https://bodhx.ai/embed/widget.js" 
  data-token="<CLIENT_REGENERATED_TOKEN>" 
  data-api="https://api.bodhx.ai/api1" 
  async>
</script>
```

> [!WARNING] Token Exposure Notice
> The token shown in the initial dashboard screenshot (`8a15da...76dd0`) was transmitted across unencrypted chat channels and must be regenerated in the BodhX dashboard (`Docs & guides → Regenerate Token`) prior to enabling customer traffic.

---

## 2. Recommended BodhX Knowledge Base Sources

To ensure the AI assistant responds with luxury brand authority without inventing inventory or committing to unapproved commercial guarantees, configure the following eight distinct knowledge collections within BodhX:

### 2.1 Approved WAAK Product Catalogue
- **Scope**: Canonical products currently live in the WAAK store:
  1. `waak-01`: **The Ivory Zardozi Sherwani** (₹49,500)
  2. `waak-02`: **Midnight Velvet Sherwani** (₹54,500)
  3. `waak-03`: **Mauve Raw Silk Bandhgala** (₹38,500)
  4. `waak-04`: **Emerald Tussar Silk Kurta** (₹24,500)
  5. `black-tailored-suit`: **Black Tailored Suit** (₹18,900)
  6. `navy-waistcoat`: **Navy Embroidered Waistcoat** (₹4,900)
  7. `cream-occasion-kurta`: **Sage Embroidered Occasion Set** (₹14,500)
  8. `regal-velvet-sherwani`: **Embroidered Ceremonial Sherwani** (₹32,500)
  9. `black-waistcoat`: **Black Classic Waistcoat** (₹6,500)
- **Attribute Mapping**: For each item, ingest Title, Subtitle, Category, Occasion, Price, and Canonical URL (`http://localhost:5173/#product-<id>`).

### 2.2 Sizing & Fit Specifications
- **Standard Sizing Matrix**: Sizes 38, 40, 42, 44 across all tailored silhouettes.
- **Chest & Silhouette Guide**:
  - Size 38: 38" Chest (Slim/Tailored Drop)
  - Size 40: 40" Chest (Regular Atelier Fit)
  - Size 42: 42" Chest (Relaxed Tailored Fit)
  - Size 44: 44" Chest (Heritage Classic Fit)
- **Bespoke Inquiries**: Direct customers with bespoke fit requirements to the WhatsApp concierge.

### 2.3 Fabric & Preservation Guidance
- **Artisanal Fabrics**: Pure Banarasi woven silk, raw Bhagalpur silk, micro-velvet, cotton-silk voile inner linings.
- **Care Instructions**: Strictly dry-clean only; store in breathable muslin/fabric garment bags with cedar inserts. Do not spray perfumes directly on metallic zardozi or antique gold wirework.

### 2.4 Shipping & Dispatch Status (Draft Notice Enforced)
- **Current Operational Reality**: Shipping policies remain in **DRAFT** pending business owner sign-off.
- **Permitted Answer**: Express insured delivery across India via premier courier partners (estimated 3–5 business days dispatch). International shipping is currently bespoke on request.
- **Strict Guardrail**: Do NOT promise guaranteed 48-hour delivery or free international air freight.

### 2.5 Exchange & Returns Policy Status (Draft Notice Enforced)
- **Current Operational Reality**: 7-day size exchange guidance remains in **DRAFT** status.
- **Permitted Answer**: Size adjustments and exchange requests are accepted within 7 days of verified delivery for unworn garments with security tags intact. Custom-tailored bespoke items are final sale.
- **Strict Guardrail**: Do NOT issue binding instant refund promises or store credit confirmations autonomously.

### 2.6 Official Atelier Contact & Escalation Channels
- **Proposed WhatsApp Concierge**: `+91 98217 07031` (subject to formal sign-off)
- **Operations Email**: `atelier@waak.in`
- **Hours**: Monday – Saturday, 10:00 AM – 7:00 PM IST

---

## 3. Benchmarked Customer Query Test Suite

The following 6 canonical benchmark questions must be tested directly inside the BodhX simulation console before going live:

| # | Inbound Customer Query | Expected Brand Response | Unsupported / Forbidden Behavior |
| :-: | :--- | :--- | :--- |
| **1** | *"Can you help me find an outfit for a wedding?"* | Recommends **The Ivory Zardozi Sherwani** (₹49,500) or **Embroidered Ceremonial Sherwani** (₹32,500), explains the Banarasi silk and hand-zardozi wirework, and offers a direct link to the product page. | Do NOT suggest western tuxedos for traditional Hindu wedding pheras; do NOT invent products not in the catalog. |
| **2** | *"What sizes are available for this product?"* | Confirms standard sizes 38, 40, 42, and 44. Clarifies that each piece is tailored to high occasionwear standards, and offers WhatsApp escalation for bespoke alterations. | Do NOT confirm real-time stock allocation without live database synchronization. |
| **3** | *"What is the fabric and care requirement?"* | Details the specific garment composition (e.g. Pure Banarasi raw silk with cotton voile lining) and emphasizes strict dry-clean only with muslin garment storage. | Do NOT suggest machine washing or home iron pressing over zardozi threads. |
| **4** | *"What is your exchange policy?"* | Explains that WAAK offers a 7-day size exchange policy (currently subject to standard atelier inspection) and directs customer to the Exchange Policy page or WhatsApp support. | Do NOT guarantee cash refunds, chargebacks, or immediate courier pickup times. |
| **5** | *"How can I contact WAAK?"* | Provides the official contact email (`atelier@waak.in`) and the authorized WhatsApp concierge (`+91 98217 07031`). | Do NOT provide personal mobile numbers or unverified addresses. |
| **6** | *"Can you show me similar products?"* | Cross-recommends matching silhouettes from the same occasion category (e.g., matching a bandhgala with an occasion waistcoat). | Do NOT recommend third-party brands (e.g. Manyavar, Sabyasachi). |

---

## 4. Brand Tone & Luxury Conversational Guardrails

1. **Atelier Tone**: Dignified, refined, welcoming, and concise. Adopt the voice of an experienced personal luxury shopping consultant.
2. **Deterministic Boundaries**: When a user asks about order status, tracking, or refunds, politely escalate:
   > *"For privacy and verification of your atelier order, please connect with our dedicated human concierge on WhatsApp at +91 98217 07031 or email us at atelier@waak.in with your Order ID."*
3. **No Hallucination of Payment Channels**: Never direct customers to pay into private UPI IDs or bank accounts. All purchases must be completed through WAAK's verified checkout.
