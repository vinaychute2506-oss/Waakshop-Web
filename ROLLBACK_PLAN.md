# WAAK Platform — Staging and Production Rollback Plan

This document establishes the precise emergency rollback protocols in the event of an unrecoverable failure during staging or production deployment.

---

## 1. Rollback Criteria

Initiate immediate rollback if any of the following occur:
1. Database migration failure resulting in schema inconsistency.
2. Inability of the API Gateway to pass internal health checks (`/health`) within 60 seconds of deployment.
3. Razorpay webhook verification failure under verified sandbox payloads.
4. Severe regression in the storefront presentation (e.g., broken curtain reveal or distorted product grid).

---

## 2. Git & Release Rollback Strategy

WAAK maintains immutable tags and protected branches:
- **Client Presentation Baseline:** Tag `waak-v3.1-client-preview` at commit `ae75687` on `master`.
- **Pre-Staging Audited Commit:** Commit `732892d` on `phase2-backend`.

### Rollback Code to Previous Verified Commit
```bash
# 1. Fetch current remote state
git fetch origin

# 2. Revert to previous verified commit
git checkout phase2-backend
git reset --hard 732892d

# 3. Clean untracked artifacts (preserving .env)
git clean -fd -e .env -e .env.staging
```

---

## 3. Container & Docker Compose Rollback

If a newly deployed container image fails to start or exhibits errors:

### Step 1: Re-deploy Previous Container Images
```bash
# Stop failing staging stack
docker compose -f docker-compose.staging.yml down

# Revert git checkout or pull previous tagged image
docker compose --env-file .env.staging -f docker-compose.staging.yml build
docker compose --env-file .env.staging -f docker-compose.staging.yml up -d
```

### Step 2: Emergency Container Health Check
```bash
docker compose -f docker-compose.staging.yml ps
curl -i http://localhost:9000/health
```

---

## 4. Database Schema & Data Rollback Protocol

Because WAAK uses non-destructive, versioned migrations (`schema_migrations` table):
- Tables and columns are added with `IF NOT EXISTS`.
- No table drops or destructive alterations occur automatically.

### Database Snapshot Restoration (if data corruption occurs)
```bash
# 1. Terminate open connections
docker exec -i waak-staging-postgres psql -U waak_staging_admin -d postgres -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'waak_staging_commerce' AND pid <> pg_backend_pid();"

# 2. Restore the pre-deployment snapshot
docker exec -i waak-staging-postgres pg_restore -U waak_staging_admin -d waak_staging_commerce --clean --if-exists < pre_deploy_safety.dump

# 3. Restart backend service
docker restart waak-staging-backend
```

---

## 5. Escalation Contacts & Post-Incident Action
- **Platform Architecture & Backend:** Atelier Commerce Lead (`atelier@waak.in`)
- **Payment Operations:** Razorpay Merchant Support / Integration Team
- **Incident Post-Mortem:** Conduct a root-cause analysis (RCA) within 24 hours of any rollback before re-attempting deployment.
