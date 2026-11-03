# WAAK Commerce Platform — Environment Configuration Guide

This document defines the separation of environments across Local Development, Staging, and Production.

---

## 1. Environment Matrix

| Dimension | Local Development | Staging (Phase 2.2 / 2.3) | Production Launch (Phase 2.4) |
|:---|:---|:---|:---|
| **NODE_ENV** | `development` | `staging` | `production` |
| **API Port** | `9000` | `9000` (Docker internal) | `9000` (Container internal) |
| **Storefront Port** | `5173` (Vite dev) | `8080` (Docker Nginx) | `443` (CDN / Edge) |
| **HTTPS / TLS** | Optional (HTTP localhost) | Mandatory (Let's Encrypt / Cloudflare) | Mandatory (Strict HSTS, TLS 1.3) |
| **PostgreSQL** | Local Docker / Native | Isolated Docker container | Managed RDS / Cloud SQL with automated snapshots |
| **Redis** | Local Docker / Native | Isolated Docker container | Managed Redis / ElastiCache |
| **Database Encryption** | Disabled | In-transit SSL optional | In-transit SSL & Encryption at rest mandatory |
| **Razorpay Mode** | Sandbox (`rzp_test_...`) | Sandbox (`rzp_test_...`) | Live Merchant (`rzp_live_...`) |
| **Webhook Delivery** | Mock / Local tests | Real HTTPS Webhook from Razorpay Test Mode | Verified Live Webhook Endpoint |
| **Admin Password** | Default allowed for tests | Strict unique password enforced | Forced 2FA / SSO + strict unique credentials |
| **Mock Signatures** | Allowed for automated tests | Strictly blocked (`ALLOW_MOCK_PAYMENTS=false`) | Strictly blocked |

---

## 2. Environment Variables Specification

### Core Application Configuration
- `NODE_ENV`: Application execution mode (`development`, `staging`, `production`, `test`).
- `PORT`: HTTP port the Express server binds to (default: `9000`).
- `CORS_ORIGIN`: Comma-separated list of allowed origins. Wildcards (`*`) are disallowed in production.

### Database & Storage
- `DATABASE_URL`: PostgreSQL connection string (`postgres://user:password@host:port/database`).
  - Staging/Production must not use the local default password (`waak_secret_2026`).
- `REDIS_URL`: Redis connection URL (`redis://host:port`). Used for multi-instance distributed rate limiting and cache.

### Authentication & Sessions
- `JWT_SECRET`: High-entropy string used to sign and verify JSON Web Tokens.
  - Staging/Production rule: Minimum 32 characters; default dev secrets are rejected during startup.

### Razorpay Payment Sandbox
- `RAZORPAY_KEY_ID`: Razorpay Key ID.
  - Must start with `rzp_test_` during Phase 2.2 and 2.3.
  - Any key starting with `rzp_live_` triggers a hard crash in staging to protect real accounts.
- `RAZORPAY_KEY_SECRET`: Secret key matching the Key ID.
- `RAZORPAY_WEBHOOK_SECRET`: Secret token used to verify HMAC-SHA256 signatures on incoming webhook payloads.
- `ALLOW_MOCK_PAYMENTS`: Boolean (`true`/`false`). Only enabled for automated test scripts in development.

### Atelier Admin Operations
- `ADMIN_EMAIL`: Administrative user email (default: `atelier@waak.in`).
- `ADMIN_PASSWORD`: Administrator password. Default `waakAdmin2026!` is blocked in staging and production.

---

## 3. Secret Management & Storage Best Practices

1. **Never commit `.env` files**: All `.env*` files (except `.env.example`) are ignored by `.gitignore`.
2. **Key Rotation**: Rotate `JWT_SECRET` and `RAZORPAY_KEY_SECRET` every 90 days.
3. **CI/CD Injection**: Inject secrets via GitHub Actions Secrets, AWS Parameter Store, or HashiCorp Vault.
