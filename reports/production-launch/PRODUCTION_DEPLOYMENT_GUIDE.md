# WAAK Occasionwear — Production Deployment Guide

**Target Environment**: Linux Ubuntu 22.04 / 24.04 LTS (GoDaddy VPS or Cloud Host)  
**Deployment Tooling**: Docker Compose v2, Nginx, Let's Encrypt Certbot  
**Release Baseline**: Git Branch `release/waak-production`  
**API Port**: 9000 (Internal)  
**Public Ports**: 80 (HTTP Redirect), 443 (HTTPS Secure)

---

## 1. Server Prerequisites & Initial Provisioning

Execute on the clean production server over SSH:

```bash
# 1. Update OS packages
sudo apt update && sudo apt upgrade -y

# 2. Install essential utilities and Docker Engine
sudo apt install -y curl git ufw certbot

curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. Configure Firewall (UFW)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Certbot & Web redirect)
sudo ufw allow 443/tcp   # HTTPS (Secure Commerce Gateway)
sudo ufw --force enable

# Note: Ports 5432 (Postgres), 6379 (Redis), and 9000 (Express) MUST remain blocked from public internet.
```

---

## 2. Codebase Retrieval & Release Branch Checkout

```bash
# Clone the repository onto the production server
sudo mkdir -p /var/www/waak
sudo chown -R $USER:$USER /var/www/waak
cd /var/www/waak

git clone https://github.com/vinaychute2506-oss/Waakshop-Web.git .
git checkout release/waak-production
```

---

## 3. Environment Secrets Configuration

Create `/var/www/waak/.env.production` based on [PRODUCTION_ENVIRONMENT_TEMPLATE.md](file:///C:/Users/Takemichi/Desktop/Waak%20Shop%20Web/reports/production-launch/PRODUCTION_ENVIRONMENT_TEMPLATE.md):

```bash
cp reports/production-launch/PRODUCTION_ENVIRONMENT_TEMPLATE.md .env.production
nano .env.production
```

Generate secure, high-entropy secrets for production:
```bash
# Generate 64-character secrets
openssl rand -hex 32  # For JWT_SECRET
openssl rand -hex 24  # For POSTGRES_PASSWORD
openssl rand -hex 24  # For REDIS_PASSWORD
openssl rand -hex 24  # For ADMIN_PASSWORD
```

---

## 4. Initial SSL Certificate Generation

Before starting Nginx with HTTPS, obtain the initial Let's Encrypt certificate using standalone mode:

```bash
# Temporarily bind port 80 to obtain certs
sudo certbot certonly --standalone \
  -d waak.co.in -d www.waak.co.in \
  --email concierge@waak.co.in \
  --agree-tos --no-eff-email
```

Ensure the generated certs exist at `/etc/letsencrypt/live/waak.co.in/`.

---

## 5. Launching the 4-Tier Commerce Stack

```bash
# Pull base images and build custom multi-stage containers
docker compose -f docker-compose.prod.yml --env-file .env.production build

# Start services in daemon mode
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Verification & Health Checking
```bash
# Check running containers
docker compose -f docker-compose.prod.yml ps

# Output should confirm:
# waak-prod-postgres  (healthy)
# waak-prod-redis     (healthy)
# waak-prod-backend   (healthy)
# waak-prod-frontend  (healthy)
# waak-prod-gateway   (running on ports 80/443)

# Verify health endpoint internally
curl -i http://localhost:9000/health
```

---

## 6. Automated Database Migrations Verification

When `waak-prod-backend` initializes, it automatically runs:
`npm run build && node dist/db/migrate.js`

To verify schema tables in PostgreSQL:
```bash
docker exec -it waak-prod-postgres psql -U waak_admin -d waak_commerce_prod -c "\dt"

# Expected Tables:
# - schema_migrations
# - products
# - product_variants
# - customers
# - customer_addresses
# - carts
# - cart_items
# - orders
# - order_items
# - wishlists
# - newsletter_subscribers
```

---

## 7. Zero-Downtime Deployment & Update Procedure

When updating the application with new commits:

```bash
cd /var/www/waak
git pull origin release/waak-production

# Rebuild only modified services
docker compose -f docker-compose.prod.yml --env-file .env.production build frontend backend

# Restart containers seamlessly
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --no-deps frontend backend

# Check status
docker compose -f docker-compose.prod.yml ps
```
