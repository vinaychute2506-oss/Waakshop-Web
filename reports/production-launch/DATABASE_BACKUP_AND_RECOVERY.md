# WAAK Occasionwear — Production Database Backup, Integrity & Recovery Protocol

**Database Engine**: PostgreSQL 16 Alpine  
**Production Database Name**: `waak_commerce_prod`  
**Container**: `waak-prod-postgres`  
**Target Backup Directory**: `/var/backups/waak-postgres`

---

## 1. Automated Daily Backup Strategy

To ensure zero data loss for customer accounts, orders, and inventory:

### Backup Shell Script (`/usr/local/bin/waak-db-backup.sh`)
```bash
#!/bin/bash
set -eo pipefail

BACKUP_DIR="/var/backups/waak-postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/waak_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=14

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting WAAK PostgreSQL production backup..."

# Execute pg_dump within container and pipe through gzip
docker exec -t waak-prod-postgres pg_dump \
  -U waak_admin \
  -d waak_commerce_prod \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges | gzip -9 > "${BACKUP_FILE}"

# Verify backup size is non-zero
if [ -s "${BACKUP_FILE}" ]; then
  echo "[$(date)] Backup completed successfully: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"
else
  echo "[$(date)] ERROR: Backup file is empty!" >&2
  exit 1
fi

# Rotate backups older than 14 days
find "${BACKUP_DIR}" -type f -name "waak_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
echo "[$(date)] Backup rotation completed. Retained last ${RETENTION_DAYS} days."
```

### Automated Cron Schedule
```bash
sudo chmod +x /usr/local/bin/waak-db-backup.sh

# Run daily at 02:30 AM IST (low-traffic hour)
echo "30 2 * * * root /usr/local/bin/waak-db-backup.sh >> /var/log/waak-db-backup.log 2>&1" | sudo tee /etc/cron.d/waak-db-backup
```

---

## 2. Emergency Database Restoration Procedure

In the event of database corruption, accidental dropping of tables, or disaster recovery:

### Step 1: Stop Traffic to Backend Container
```bash
cd /var/www/waak
docker compose -f docker-compose.prod.yml stop backend
```

### Step 2: Identify and Decompress Target Backup
```bash
ls -lh /var/backups/waak-postgres/
# Choose the most recent verified backup file
TARGET_BACKUP="/var/backups/waak-postgres/waak_backup_YYYYMMDD_HHMMSS.sql.gz"
```

### Step 3: Stream Restoration into PostgreSQL Container
```bash
echo "Restoring database from ${TARGET_BACKUP}..."

gunzip -c "${TARGET_BACKUP}" | docker exec -i waak-prod-postgres psql \
  -U waak_admin \
  -d waak_commerce_prod
```

### Step 4: Verify Restored Schema & Counts
```bash
docker exec -it waak-prod-postgres psql -U waak_admin -d waak_commerce_prod -c "
SELECT 
  (SELECT COUNT(*) FROM products) as products,
  (SELECT COUNT(*) FROM product_variants) as variants,
  (SELECT COUNT(*) FROM orders) as orders,
  (SELECT COUNT(*) FROM customers) as customers;
"
```

### Step 5: Restart Backend Service
```bash
docker compose -f docker-compose.prod.yml start backend
curl -i http://localhost:9000/health
```

---

## 3. Off-Site Backup Replication (Recommended)

To protect against catastrophic server or datacenter hardware loss:
1. Synchronize `/var/backups/waak-postgres` daily to an encrypted Amazon S3 / Cloudflare R2 bucket:
   ```bash
   aws s3 sync /var/backups/waak-postgres s3://waak-cold-backups/postgres/ --sse AES256
   ```
2. Enable 30-day lifecycle expiration on the cold storage bucket.
