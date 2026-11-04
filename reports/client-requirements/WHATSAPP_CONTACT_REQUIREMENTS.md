# WAAK — WhatsApp Concierge Integration Requirements

**Document Purpose**: Implementation Specification & Dependency Tracking for WhatsApp Contact  
**Feature Status**: **BLOCKED ON BUSINESS DEPENDENCY** (No verified phone number provided)  
**Security Boundary**: Zero transmission of patron credentials, passwords, addresses, or payment tokens

---

## 1. Dependency Status & Audit Finding

- **Client Feedback**: *"Add WhatsApp for customers who need more details."*
- **Audit Result**: Inspected [`src/components/PolicyView.tsx:451`](file:///c:/Users/Takemichi/Desktop/Waak%20Shop%20Web/src/components/PolicyView.tsx#L451), `backend/.env`, and all configuration files.
- **Current State**: The codebase explicitly states:
  > *"Direct WhatsApp & Telephonic Line: Dedicated line allocation pending commercial carrier provisioning."*
- **Core Directive**: **We must NOT invent a dummy or personal phone number.** Providing an unverified phone number creates severe operational, reputation, and security risks (e.g. routing bridal inquiries to an unmonitored line or personal cell phone).

---

## 2. Technical Implementation Architecture (When Unblocked)

Once the client provides their official Indian WhatsApp Business number (E.164 format: `+91XXXXXXXXXX`), the integration will follow this architecture:

### A. Environment Configuration
The number must be controlled via environment variables, not hardcoded into components:
- Frontend: `VITE_WHATSAPP_BUSINESS_NUMBER` in `.env` (e.g. `919876543210`)
- Staging default: If unset or empty, the UI safely hides the WhatsApp trigger or displays an "Atelier Consultation by Email" fallback modal.

### B. Two-Point Placement Strategy
1. **Persistent Floating Concierge Trigger (All Devices)**:
   - Positioned fixed in the bottom-right corner (`bottom: 24px; right: 24px; z-index: 990;`).
   - On mobile PDP where the sticky action bar is active, the button floats above the bar (`bottom: 84px; right: 16px;`).
   - Design: 50px diameter circle, dark burgundy velvet background, gold border, gold WhatsApp SVG insignia.
   - Accessible label: `aria-label="Contact WAAK Bridal Concierge via WhatsApp"`.
2. **Contextual Product Detail Page Button**:
   - Placed directly beneath the primary "Add to Shopping Bag" button on PDP.
   - Styling: Transparent background, 1px gold border, burgundy text, WhatsApp icon.
   - Label: `"Inquire with Master Stylist via WhatsApp"`.

---

## 3. Contextual Prefilled Message Templates (Non-Sensitive)

The URL will invoke WhatsApp's official click-to-chat API (`https://wa.me/<number>?text=<encoded_text>`).

### Privacy Rule: Zero Customer Personal Data
- **Allowed**: Product Name, SKU, Selected Size, Page URL.
- **Strictly Prohibited**: Customer Name, Email, Street Address, Order Amount, Payment Status, IP Address, or Session Tokens.

### Template 1: Product Inquiry (PDP Context)
```
Hello WAAK Atelier,

I am inquiring about the {product.name} (SKU: {product.sku || product.id}).
Size of interest: {selectedSize || "General Sizing Guidance"}.

Could your styling team assist me with fitting specifications and delivery timelines?
```
*URL Example*:  
`https://wa.me/91XXXXXXXXXX?text=Hello%20WAAK%20Atelier%2C%20I%20am%20inquiring%20about%20The%20Ivory%20Zardozi%20Sherwani...`

### Template 2: General Bridal & Groom Consultation (Global Floating Button)
```
Hello WAAK Atelier,

I would like to schedule a private styling consultation for an upcoming wedding celebration. Could you please share your bridal and groom styling availability?
```

---

## 4. Mobile & Desktop Cross-Platform Behavior

- **Mobile Viewports (iOS / Android)**:  
  Tapping the link initiates the universal URI scheme `whatsapp://send` or `https://wa.me`, seamlessly launching the native WhatsApp application.
- **Desktop Viewports (Windows / macOS)**:  
  Clicking opens a new secure tab (`target="_blank" rel="noopener noreferrer"`) directing to `https://web.whatsapp.com/send` or the WhatsApp Desktop App.

---

## 5. Unblocking Checklist for Client

To activate this feature, the client must furnish:
1. [ ] **Official WhatsApp Business Account Number** in international format (`+91 ...`).
2. [ ] **Verification of Business Profile**: Profile name configured as "WAAK Occasionwear" with official gold logo and business hours.
3. [ ] **Atelier Operating Schedule**: Confirmation of response hours (e.g. 10:00 AM – 7:00 PM IST) for automated greeting setup.
