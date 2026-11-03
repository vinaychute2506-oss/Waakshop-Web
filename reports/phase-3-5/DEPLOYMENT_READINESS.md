# WAAK — Phase 3.5: Deployment & Infrastructure Readiness Report

**Audit Target**: Container Architecture, Staging Orchestration, Network Isolation, and Production Cutover Plan  
**Auditor**: Antigravity DevOps & Site Reliability Engineering  
**Date**: November 3, 2026  
**Status**: Multi-Container Staging Environment Verified  

---

## 1. Executive Summary

WAAK's staging environment is fully containerized and orchestrated via Docker Compose (`docker-compose.staging.yml`). The architecture isolates sensitive stateful services (PostgreSQL 16 and Redis 7) within a private internal bridge network (`waak-staging-net`), preventing external exposure on the host network.

Automated container health probes, SPA client-side fallback routing via Nginx Alpine, and immutable static caching headers were audited and verified under live HTTP requests.

---

## 2. Infrastructure Architecture & Service Topology

```
             ┌─────────────────────────────────────────────────────────────┐
             │                     Host Machine / Edge                     │
             │                                                             │
             │   Port 8088                                     Port 9001   │
             └──────┬──────────────────────────────────────────────┬───────┘
                    │                                              │
                    ▼                                              ▼
       ┌────────────────────────┐                    ┌──────────────────────────┐
       │ waak-staging-frontend  │                    │   waak-staging-backend   │
       │ (Nginx 1.25 Alpine)    │                    │   (Node.js 20 LTS)       │
       │ Static Assets & SPA    │                    │   Express API Gateway    │
       └────────────────────────┘                    └─────────────┬────────────┘
                                                                   │
                                 Private Docker Bridge             │
                              Network: waak-staging-net            │
                                ┌──────────────────────────────────┴────────────┐
                                │                                               │
                                ▼                                               ▼
                     ┌──────────────────────┐                       ┌──────────────────────┐
                     │ waak-staging-postgres│                       │  waak-staging-redis  │
                     │ (PostgreSQL 16)      │                       │  (Redis 7 Alpine)    │
                     │ Internal Port: 5432  │                       │  Internal Port: 6379 │
                     │ Unexposed to Host    │                       │  Unexposed to Host   │
                     └──────────────────────┘                       └──────────────────────┘
```

### Container Specifications

| Container Name | Base Image | Exposed Ports | Internal Healthcheck Command | Status |
| :--- | :--- | :---: | :--- | :---: |
| **`waak-staging-frontend`** | `nginx:alpine` | `8088:80` | `wget -q --spider http://127.0.0.1/ \|\| exit 1` | **Healthy** (Up 7h+) |
| **`waak-staging-backend`** | Node.js 20 Alpine | `9001:9000` | `wget -qO- http://127.0.0.1:9000/health \|\| exit 1` | **Healthy** (Up 7h+) |
| **`waak-staging-postgres`** | `postgres:16-alpine` | *Internal Only* | `pg_isready -U waak_staging_admin -d waak_staging_commerce` | **Healthy** (Up 7h+) |
| **`waak-staging-redis`** | `redis:7-alpine` | *Internal Only* | `redis-cli ping` | **Healthy** (Up 7h+) |

---

## 3. Network Hardening & Secret Management

### 3.1 Network Isolation
* The PostgreSQL and Redis containers do not publish host port bindings (`ports:` is intentionally omitted; only `expose:` is defined for internal container communication).
* Only the frontend web server (port 8088) and backend API gateway (port 9001) are accessible on localhost.

### 3.2 Environment Separation
* **Staging Database**: `waak_staging_commerce` (completely separated from developer local databases `waak_dev`).
* **Environment Variables**:
  - `NODE_ENV=staging`
  - `ALLOW_MOCK_PAYMENTS=true` (Allows automated sandbox tests; must be set to `false` in production).
  - `RAZORPAY_KEY_ID`: Sandbox test key only.
  - Secret keys (`JWT_SECRET`, `RAZORPAY_WEBHOOK_SECRET`) use strong distinct passphrases and are injected via container environment parameters.

---

## 4. Frontend Web Server & Asset Delivery

### 4.1 SPA Fallback Routing
* Nginx configuration includes `try_files $uri $uri/ /index.html =404;`.
* Client-side policy routes (`/terms-and-conditions`, `/privacy-policy`, `/shipping-and-delivery`, `/returns-and-exchanges`, `/care-and-preservation`) and product detail links resolve directly to the React application on hard refresh without 404 errors.

### 4.2 Asset Caching & Optimization
* Static bundles compiled with unique Vite content hashes (`assets/*.js`, `assets/*.css`) are served with HTTP header:
  `Cache-Control: max-age=31536000, public, no-transform, immutable`.
* HTML entry files (`index.html`) are served with `Cache-Control: no-cache` to ensure instantaneous client updates upon new deployments.

---

## 5. Production Cutover Checklist (Phase 4.0 Pre-Requisites)

When transitioning from the staging pilot to public commercial launch:

1. **DNS & HTTPS Provisioning**:
   - Provision DNS `A` records pointing `waak.in` and `api.waak.in` to the production reverse proxy.
   - Configure Let's Encrypt automated TLS certificates or Cloudflare SSL termination.
2. **Production Environment Secrets**:
   - Generate production `JWT_SECRET` (minimum 64 cryptographically secure random bytes).
   - Set `NODE_ENV=production`.
   - Set `ALLOW_MOCK_PAYMENTS=false`.
   - Replace test Razorpay keys with verified live merchant credentials.
3. **Database Migration & Backup**:
   - Run automated database migration scripts against the clean production PostgreSQL instance.
   - Configure hourly automated pg_dump backups with offsite encrypted S3 storage.
4. **Logistics & Notification Integration**:
   - Connect live shipping API (Delhivery/Shiprocket) for real-time address validation.
   - Configure transactional email provider (AWS SES / SendGrid) for order and newsletter notifications.
