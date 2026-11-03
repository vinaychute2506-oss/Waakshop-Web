# WAAK Phase 3.1 — Remaining Issues & Roadmap

---

## 1. Status of Resolved Items

| Item | Status | Verification |
|---|---|---|
| **Indian PIN Code Validation** | **Resolved** | Strictly 6 numeric digits enforced on client and backend (`/^\d{6}$/`). Whitespace cleanly trimmed. Accessible errors surfaced. Tested across 5 invalid formats. |
| **Dynamic Catalog Hydration** | **Resolved** | Loaded dynamically from `/store/products`, falls back gracefully to cached preview. |
| **Skeleton & Loading States** | **Resolved** | 3:4.3 luxury gold shimmer cards rendered during hydration. |
| **Missing Silhouette State** | **Resolved** | Graceful "Silhouette Not Found" view rendered in `ProductDetail.tsx`. |
| **Regression Protection** | **Resolved** | 172/172 assertions passing across dev and staging. 0 TypeScript build errors. |

---

## 2. Scope Boundaries Maintained in Phase 3.1

As directed by the project roadmap, the following areas were strictly preserved and held out-of-scope for Phase 3.1:
1. **Courier Serviceability API**: PIN code validation confirms valid Indian 6-digit format. No courier partner (Shiprocket/Delhivery/Blue Dart) API is linked yet, and the application makes no claims of courier delivery zones.
2. **Phase 3.2 Legal Pages**: Dedicated routes for `/terms`, `/privacy`, `/shipping-policy`, and `/returns` remain scheduled for Phase 3.2.
3. **Newsletter Backend Persistence**: Newsletter subscription UI remains functional with client-side feedback; database persistence and automated welcome campaigns are part of Phase 3.2.
4. **Live Razorpay Credentials**: All transactions and webhook signatures remain strictly locked in sandbox/test mode (`rzp_test_...` / `mock_test_signature`).

---

## 3. Recommended Phase 3.2 Milestones

1. **Phase 3.2: Legal & Informational Pages**
   - Create dedicated editorial routes matching WAAK typography for Shipping Policy, Returns & Exchange, Privacy Policy, and Terms of Bespoke Service.
   - Connect footer navigation links directly to these routes.
2. **Newsletter & Customer Engagement**
   - Implement backend endpoint `POST /store/newsletter` storing patron subscriptions with duplicate guards.
3. **Logistics & Courier Partner Integration (Post-Launch)**
   - Connect Indian PIN codes to a courier API serviceability matrix to provide estimated delivery timeframes based on live postal zones.
