# WAAK Occasionwear — Production Environment Variable Specification

**Template File**: `.env.production`  
**Security Notice**: **NEVER COMMIT FILLED SECRETS TO GIT**. Store production credentials exclusively on the secure host server with `chmod 600`.

---

```ini
# ==============================================================================
# 1. CORE APPLICATION RUNTIME
# ==============================================================================
NODE_ENV=production
PORT=9000
TZ=Asia/Kolkata

# Public Storefront and API Domain Names (No trailing slashes)
FRONTEND_URL=https://waak.co.in
API_URL=https://waak.co.in/store

# CORS Allowed Origins (Comma-separated exact origins)
CORS_ORIGIN=https://waak.co.in,https://www.waak.co.in

# ==============================================================================
# 2. POSTGRESQL PRODUCTION DATABASE
# ==============================================================================
POSTGRES_USER=waak_admin
# Generate via: openssl rand -hex 24
POSTGRES_PASSWORD=REPLACE_WITH_SECURE_64_CHAR_PASSWORD
POSTGRES_DB=waak_commerce_prod
DATABASE_URL=postgres://waak_admin:REPLACE_WITH_SECURE_64_CHAR_PASSWORD@postgres:5432/waak_commerce_prod

# ==============================================================================
# 3. REDIS 7 IN-MEMORY CACHE & SESSION STORE
# ==============================================================================
# Generate via: openssl rand -hex 24
REDIS_PASSWORD=REPLACE_WITH_SECURE_REDIS_PASSWORD
REDIS_URL=redis://:REPLACE_WITH_SECURE_REDIS_PASSWORD@redis:6379

# ==============================================================================
# 4. JSON WEB TOKEN (JWT) SECURITY SPECIFICATION
# ==============================================================================
# High-entropy cryptographic key (Min 32 characters, recommended 64)
# Generate via: openssl rand -hex 32
JWT_SECRET=REPLACE_WITH_STRONG_HIGH_ENTROPY_64_CHAR_SECRET_KEY!
JWT_EXPIRES_IN=30d

# ==============================================================================
# 5. ATELIER ADMIN CONSOLE CREDENTIALS
# ==============================================================================
ADMIN_EMAIL=atelier@waak.co.in
# Generate via: openssl rand -hex 16
ADMIN_PASSWORD=REPLACE_WITH_SECURE_ATELIER_ADMIN_PASSWORD

# ==============================================================================
# 6. RAZORPAY PAYMENT GATEWAY SPECIFICATION
# ==============================================================================
# Live credentials MUST start with rzp_live_
# For Interim Option A launch, retain rzp_test_waak2026demo
RAZORPAY_KEY_ID=rzp_test_waak2026demo
RAZORPAY_KEY_SECRET=REPLACE_WITH_LIVE_RAZORPAY_KEY_SECRET_WHEN_APPROVED
RAZORPAY_WEBHOOK_SECRET=REPLACE_WITH_LIVE_RAZORPAY_WEBHOOK_SECRET_WHEN_APPROVED

# Strict Guard: Must be false in live production
ALLOW_MOCK_PAYMENTS=false

# ==============================================================================
# 7. SHIPROCKET CARRIER LOGISTICS CREDENTIALS
# ==============================================================================
# Production credentials provided by client via Shiprocket API portal
SHIPROCKET_EMAIL=
SHIPROCKET_PASSWORD=
SHIPROCKET_API_BASE=https://apiv2.shiprocket.in/v1/external

# Warehouse pickup coordinates (English Channel Company Gandhi Nagar Atelier)
SHIPROCKET_PICKUP_PINCODE=110033

# ==============================================================================
# 8. WHATSAPP CONCIERGE & CLIENT CONTACT
# ==============================================================================
# Client confirmed business support contact (E.164 normalized digits only)
VITE_WHATSAPP_NUMBER=919821707031

# ==============================================================================
# 9. BODHX AI CONCIERGE WIDGET SPECIFICATION
# ==============================================================================
# Keep false until Ankur supplies the replacement regenerated public token
VITE_BODHX_WIDGET_ENABLED=false
VITE_BODHX_WIDGET_TOKEN=
VITE_BODHX_API_BASE=https://api.bodhx.ai/api1

# ==============================================================================
# 10. SYSTEM LOGGING & MONITORING
# ==============================================================================
LOG_LEVEL=info
```
