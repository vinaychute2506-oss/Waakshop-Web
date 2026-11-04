# WAAK — Exchange Policy Approval Items & Commercial Decisions

**Document Type**: Legal & Business Operations Sign-Off Register  
**Current Policy Status**: Internal Unapproved Draft (Governed by Amber Warning Notice)  
**Applicable Surfaces**: [`/returns-and-exchanges`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/src/components/PolicyView.tsx#L293), [`ProductDetail.tsx`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/src/ProductDetail.tsx#L734), [`Footer.tsx`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/src/components/Footer.tsx#L210)

---

## 1. Executive Summary

The client requested: **"Add ... easy exchanges to improve customer trust."**

While our technical storefront already includes a dedicated `/returns-and-exchanges` route, footer links, and accordion references on the product detail page, **the commercial terms are currently internal drafts and cannot be legally published without formal executive sign-off.** In luxury Indian weddingwear, premature promises regarding returns can create substantial commercial and operational liabilities.

---

## 2. Mandatory Business Decisions Required

Before removing the draft disclaimers or advertising "Easy Exchanges" on the homepage, the business must formally resolve the following 5 commercial gates:

| Gate | Current Draft Specification | Open Business Question | Commercial / Financial Impact | Required Sign-Off |
| :---: | :--- | :--- | :--- | :---: |
| **G1** | **Exchange Time Window**<br>7 calendar days from confirmed delivery | Should the window be **7 days**, **14 days**, or **48 hours** for bridal/groom wear? | Wedding wear is frequently worn once and returned. A shorter window (48-72 hours) protects against wardrobing fraud; a longer window increases patron confidence. | Merchandising & Founder |
| **G2** | **Bespoke & Alteration Exclusions**<br>Custom-tailored and monogrammed pieces ineligible for return, but eligible for free master alteration | What defines "bespoke"? Does selecting chest size 40 qualify as ready-to-wear, while custom sleeve adjustments qualify as bespoke? | Ready-to-wear standard sizes (38, 40, 42, 44) can be restocked; customized sherwanis cannot be resold. Strict boundary definitions are legally mandatory. | Head Master-Tailor & Operations |
| **G3** | **Damaged or Tampered Orders**<br>Report within 24 hours with photographic evidence to `concierge@waak.co.in` | Is an unboxing video required for high-value zardozi commissions (>₹50,000) to combat courier theft claims? | Hand-embroidered garments can experience transit damage or snagging. Clear evidentiary standards prevent courier dispute deadlock. | Operations & Legal Counsel |
| **G4** | **Return Transit & Reverse Logistics Fees**<br>Complimentary reverse courier pickup arranged by atelier concierge | Does WAAK absorb reverse courier charges (~₹800–₹1,500 per insured heavy sherwani package), or deduct it from exchange credit? | Absorbing reverse transit costs on low-margin items affects unit economics; charging for returns increases friction. | Finance & Logistics Lead |
| **G5** | **Exchange vs. Cash Refund Policy**<br>Store credit and size exchange only; no cash/gateway refunds | Does WAAK permit bank refunds, or strictly issue Atelier Store Credit / direct size exchange? | Under India's Consumer Protection (E-Commerce) Rules 2020, return/refund rules must be explicitly and unambiguously disclosed prior to purchase. | Legal Counsel & Founder |

---

## 3. Surface Audit: Where Exchange Claims Currently Appear

| Surface | Exact Code Location | Current Text & Context | Draft Disclaimer Status | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **Policy View** | `PolicyView.tsx:311-350` | Full 3-section policy detailing 7-day exchange, standard vs bespoke, reverse transit | **Covered**: Explicit amber banner declaring draft status | Retain amber banner until G1–G5 sign-off is completed. |
| **PDP Accordion 4** | `ProductDetail.tsx:734-748` | *"Insured Dispatch & Atelier Exchanges"* | **Covered**: Footnote states courier transit & insurance are draft standards | Keep disclaimer active; add 1-click link to `/returns-and-exchanges`. |
| **PDP FAQ Item 5** | `ProductDetail.tsx:782-788` | *"What is WAAK's return and exchange policy for bespoke occasionwear?"* | **Covered**: Explicitly notes terms are pending corporate confirmation | Ensure text references store credit and tailor alteration, not cash refunds. |
| **PDP Tax Line** | `ProductDetail.tsx:444-446` | *"Inclusive of all taxes · Complimentary insured domestic dispatch"* | No draft warning on this single line | Qualify with asterisk (`* Complimentary domestic transit`). |
| **Checkout Price Summary** | `CheckoutModal.tsx:559` | *"Express Insured Shipping: Complimentary"* | Unqualified | Keep as test representation; formalize carrier agreement before live mode. |

---

## 4. Proposed Customer-Facing Exchange Presentation (Staging)

While awaiting business sign-off on G1–G5, the UI should guide customers toward transparency:

```
┌────────────────────────────────────────────────────────┐
│  ATELIER EXCHANGE & FITTING ASSISTANCE                 │
│                                                        │
│  • Handcrafted garments tailored to standard sizes     │
│    (38, 40, 42, 44) qualify for size exchange*.        │
│  • Personalized consultations provide complimentary    │
│    master-tailor fit adjustments upon arrival.         │
│  • Read our [Draft Exchange Policy] for eligibility,   │
│    timelines, and hygiene standards.                   │
│                                                        │
│  * Terms subject to corporate review prior to launch   │
└────────────────────────────────────────────────────────┘
```
