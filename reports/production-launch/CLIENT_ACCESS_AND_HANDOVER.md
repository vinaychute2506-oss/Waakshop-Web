# WAAK Occasionwear — Client Access, GitHub Credentials & Handover Procedure

**Handover Target**: Ankur / WAAK Brand Owners (English Channel Company)  
**Technical Contact**: Antigravity Technical Lead  
**Handover Date**: November 18, 2026  
**Git Branch**: `release/waak-production`

---

## 1. GitHub Access Details (To Share with Client)

To grant repository access for production deployment, CI/CD pipeline configuration, and ongoing maintenance, please invite the following account in GitHub:

```text
GitHub Username: vinaychute2506-oss
GitHub Account Email: vinaychute2506@gmail.com
```

### GitHub Access Instructions for Ankur:
1. Open your GitHub Repository: `https://github.com/vinaychute2506-oss/Waakshop-Web` (or your client organization repository).
2. Navigate to: **Settings → Collaborators → Add people**.
3. Search for: `vinaychute2506-oss` or `vinaychute2506@gmail.com`.
4. Grant **Admin** or **Write (Maintainer)** permissions.
5. Click **Add collaborator**.

---

## 2. GoDaddy Access Protocol (Secure Delegation)

> [!IMPORTANT]
> **DO NOT SHARE GODADDY MASTER PASSWORDS**  
> GoDaddy provides built-in secure **Delegate Access** which allows technical configuration without exposing personal or billing credentials.

### How to Grant Delegate Access:
1. Log in to [GoDaddy Account Settings](https://account.godaddy.com/).
2. Click on **Delegate Access** (under Account).
3. In the "People who can access my account" section, click **+ Invite to Access**.
4. Enter:
   - **Name**: Antigravity Technical Lead
   - **Email**: `vinaychute2506@gmail.com`
   - **Access Level**: Select **Products & Domains** (or **Manage Products**).
5. Click **Invite**.
6. The engineering team will receive a secure email invitation to manage the domain DNS and hosting environment directly without ever knowing your GoDaddy password.

---

## 3. Atelier Admin Operations Console Handover

The WAAK Admin Operations Console allows the brand team to manage physical inventory, view orders, and oversee customer inquiries without touching code.

- **Admin URL**: `https://waak.co.in/admin` (or `http://localhost:9000/admin` on staging)
- **Default Admin Account**: `atelier@waak.co.in` (Password set securely in `.env.production`)
- **Key Capabilities**:
  1. **Live Inventory Updates**: Adjust in-stock units per size (36–44) across all garments. Setting a size to `0` instantly updates the storefront to display "Out of Stock" and disables purchasing.
  2. **Order Management**: View incoming orders, patron shipping addresses, and update fulfillment states (*Pending → Processing → Dispatched*).
  3. **Low Stock Warnings**: Visual alerts highlight any ensemble with 4 or fewer remaining units.
  4. **Revenue Metrics**: Gross revenue and total order volumes calculated in real-time.

---

## 4. Brand & Content Management Runbook

1. **Adding/Updating Physical Stock**:
   - Log into `/admin`.
   - Select the target garment.
   - Enter new stock count for the desired chest size (e.g., Size 36: `5`).
   - Click "Save Inventory" — storefront reflects changes immediately.
2. **Handling Customer Inquiries via WhatsApp**:
   - Patrons clicking the WhatsApp Concierge button on any product page send a pre-formatted message to `+91 98217 07031`.
   - The message contains the exact Product Name, Product ID, and selected size.
   - Staff can directly respond with styling recommendations, custom fitting appointments, or dispatch schedules.
3. **Handling Returns & Exchanges**:
   - Verify the request date against courier delivery notification (must be within **2 days**).
   - Issue written return authorization with the atelier shipping address.
   - Upon receipt, conduct atelier quality inspection.
   - Issue lifetime store credit code to customer.
