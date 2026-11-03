# WAAK Commerce Database — Backup and Recovery Procedures

This guide provides reliable, non-destructive backup and disaster recovery procedures for PostgreSQL 16 on the WAAK platform.

---

## 1. Automated Snapshot Backups (Docker Staging)

To create an immediate binary or SQL dump from the running staging PostgreSQL container:

### Manual Full Backup
```bash
# Dump plain SQL backup with timestamps
docker exec -t waak-staging-postgres pg_dump -U waak_staging_admin -d waak_staging_commerce -F p > backup_waak_$(date +%Y%m%d_%H%M%S).sql

# Dump custom compressed binary backup (preferred for large databases)
docker exec -t waak-staging-postgres pg_dump -U waak_staging_admin -d waak_staging_commerce -F c > backup_waak_$(date +%Y%m%d_%H%M%S).dump
```

---

## 2. Automated Daily Backup Script (Cron / Systemd)

Save this script as `/opt/waak/scripts/backup.sh` on the staging host:

```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/var/backups/waak"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/waak_backup_${TIMESTAMP}.dump"
CONTAINER_NAME="waak-staging-postgres"
DB_USER="waak_staging_admin"
DB_NAME="waak_staging_commerce"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting WAAK database backup..."
docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" -F c > "${BACKUP_FILE}"

# Keep 14 days of backups; delete older dumps
find "${BACKUP_DIR}" -type f -name "waak_backup_*.dump" -mtime +14 -delete

echo "[$(date)] Backup completed successfully: ${BACKUP_FILE}"
```

Make executable and schedule in cron:
```bash
chmod +x /opt/waak/scripts/backup.sh
# Run every night at 02:00 AM
0 2 * * * /opt/waak/scripts/backup.sh >> /var/log/waak_backup.log 2>&1
```

---

## 3. Database Restoration Procedure

> [!WARNING]
> Restoring a database snapshot will overwrite existing records in the target database. Always perform a fresh backup before executing a restore operation!

### Step 1: Pre-Restore Safety Snapshot
```bash
docker exec -t waak-staging-postgres pg_dump -U waak_staging_admin -d waak_staging_commerce -F c > pre_restore_safety_$(date +%s).dump
```

### Step 2: Terminate Active Connections
```bash
docker exec -i waak-staging-postgres psql -U waak_staging_admin -d postgres <<EOF
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'waak_staging_commerce' AND pid <> pg_backend_pid();
EOF
```

### Step 3: Restore Database Snapshot
```bash
# For custom format (.dump):
docker exec -i waak-staging-postgres pg_restore -U waak_staging_admin -d waak_staging_commerce --clean --if-exists < backup_waak_20261103.dump

# For plain SQL format (.sql):
docker exec -i waak-staging-postgres psql -U waak_staging_admin -d waak_staging_commerce < backup_waak_20261103.sql
```

### Step 4: Verify Restoration & Run Migrations
```bash
# Check record counts
docker exec -i waak-staging-postgres psql -U waak_staging_admin -d waak_staging_commerce -c "SELECT COUNT(*) FROM products; SELECT COUNT(*) FROM orders;"

# Restart backend to run any pending incremental migrations
docker restart waak-staging-backend
```
