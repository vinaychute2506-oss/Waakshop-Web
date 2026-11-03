# WAAK Phase 2.2 — Staging Deployment Guide

This guide details the procedures for deploying WAAK to a dedicated staging environment (HTTPS) using Docker Compose, reverse proxies, and automated health checks while keeping Razorpay in sandbox test mode.

---

## 1. Architecture Overview

```text
[ Browser / Client ]
       │ HTTPS (443)
       ▼
[ Cloudflare / Reverse Proxy / Nginx ]
       │
       ├───────► Frontend Container (Port 80 / Nginx) ───► Static Assets (SPA)
       │
       └───────► Backend Gateway Container (Port 9000 / Express 5)
                      │
                      ├─── (Internal 5432) ───► PostgreSQL 16 (waak_staging_pgdata)
                      │
                      └─── (Internal 6379) ───► Redis 7 (waak_staging_redisdata)
```

- **Network Security:** Database and Redis services are isolated inside an internal bridge network (`waak-staging-net`). No database ports are published to the public internet.
- **Process Isolation:** The Node.js application executes as a dedicated non-root user (`node`).
- **Persistence:** PostgreSQL and Redis data are bound to Docker named volumes.

---

## 2. Prerequisites

1. **Docker Engine & Compose:** Docker Engine 24+ and Docker Compose v2+.
2. **Domain & DNS:** Staging subdomains pointing to your staging host:
   - Storefront: `staging.waak.in` (or test host IP)
   - API: `api.staging.waak.in`
3. **SSL/TLS Certificates:** Let's Encrypt or Cloudflare TLS certificates for both subdomains.
4. **Razorpay Sandbox Credentials:** Test credentials (`rzp_test_...`) from Razorpay Dashboard.

---

## 3. Deployment Steps

### Step 1: Clone Repository & Checkout Staging Branch
```bash
git clone https://github.com/waak/waak-shop-web.git
cd waak-shop-web
git checkout phase2-backend
```

### Step 2: Configure Staging Environment Variables
Create `.env.staging` on the staging host based on `backend/.env.example`:
```bash
cp backend/.env.example .env.staging
```
Set the following values in `.env.staging`:
```env
NODE_ENV=staging
PORT=9000
POSTGRES_USER=waak_staging_admin
POSTGRES_PASSWORD=<STRONG_RANDOM_PASSWORD>
POSTGRES_DB=waak_staging_commerce
JWT_SECRET=<STRONG_RANDOM_32_CHAR_SECRET>
CORS_ORIGIN=https://staging.waak.in,http://localhost:8080
RAZORPAY_KEY_ID=rzp_test_<YOUR_TEST_KEY_ID>
RAZORPAY_KEY_SECRET=<YOUR_TEST_KEY_SECRET>
RAZORPAY_WEBHOOK_SECRET=<YOUR_TEST_WEBHOOK_SECRET>
ALLOW_MOCK_PAYMENTS=false
ADMIN_EMAIL=atelier@waak.in
ADMIN_PASSWORD=<STRONG_UNIQUE_STAGING_PASSWORD>
```

### Step 3: Build & Start Staging Containers
```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml build --no-cache
docker compose --env-file .env.staging -f docker-compose.staging.yml up -d
```

### Step 4: Verify Container Health
```bash
docker compose -f docker-compose.staging.yml ps
```
Expected output:
```text
NAME                     STATUS                   PORTS
waak-staging-postgres    Up (healthy)             5432/tcp
waak-staging-redis       Up (healthy)             6379/tcp
waak-staging-backend     Up (healthy)             0.0.0.0:9000->9000/tcp
waak-staging-frontend    Up (healthy)             0.0.0.0:8080->80/tcp
```

### Step 5: Test Health Endpoints
```bash
curl -i http://localhost:9000/health
```
Expected HTTP 200 response:
```json
{
  "status": "ok",
  "service": "WAAK Occasionwear Commerce API",
  "version": "1.0.0",
  "environment": "staging",
  "database": "connected",
  "isTestPaymentMode": true
}
```

---

## 4. Reverse Proxy & SSL Configuration (Nginx Template)

Place the following configuration on your host reverse-proxy (`/etc/nginx/sites-available/waak-staging`):

```nginx
# API Gateway Reverse Proxy
server {
    listen 443 ssl http2;
    server_name api.staging.waak.in;

    ssl_certificate /etc/letsencrypt/live/staging.waak.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.waak.in/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://127.0.0.1:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
}

# Frontend Storefront Reverse Proxy
server {
    listen 443 ssl http2;
    server_name staging.waak.in;

    ssl_certificate /etc/letsencrypt/live/staging.waak.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.waak.in/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Razorpay Staging Webhook Registration

1. Log into the [Razorpay Dashboard](https://dashboard.razorpay.com/) in **Test Mode**.
2. Navigate to **Settings > Webhooks > Add New Webhook**.
3. **Webhook URL:** `https://api.staging.waak.in/store/payment/razorpay/webhook`
4. **Secret:** The string configured in `RAZORPAY_WEBHOOK_SECRET`.
5. **Active Events:**
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
6. Click **Save Webhook**.
