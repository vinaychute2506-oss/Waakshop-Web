# WAAK Occasionwear — GoDaddy Hosting & Domain Configuration Audit

**Audit Date**: November 18, 2026  
**Auditor**: Antigravity Technical Lead & Production Launch Engineering  
**Subject**: Client GoDaddy Infrastructure, Hosting Compatibility, DNS Strategy & Security Protocol

---

## 1. Security Alert: Credential Exposure & Remediation

> [!CAUTION]
> **COMPROMISED CREDENTIAL REMEDIATION REQUIRED**  
> Account credentials shared in unencrypted communication channels (such as WhatsApp screenshots) must be treated as compromised.  
> 1. **Immediate Password Rotation**: The client should immediately log in to GoDaddy and update the account master password.
> 2. **Never Share Account Owner Passwords**: Master account credentials should never be shared with developers, contractors, or AI agents.
> 3. **Use GoDaddy Delegate Access**: GoDaddy provides built-in **Delegate Access** (*Account Settings → Delegate Access → Invite to Access*). Ankur can invite the developer email directly with "Standard Access" or "Products & Domains" access without revealing any passwords.
> 4. **Enable Two-Factor Authentication (2FA)**: Mandatory 2FA via SMS or authenticator app should be enabled on the GoDaddy account.

---

## 2. GoDaddy Hosting Compatibility Analysis

WAAK requires a 4-tier stack:
- **Frontend**: Static React bundle (served via high-performance Nginx)
- **Backend**: Node.js 20 + Express API daemon with persistent process management
- **Database**: PostgreSQL 16 relational database
- **Cache/Queue**: Redis 7 memory store

### Compatibility Evaluation: GoDaddy Product Tiers

| GoDaddy Product | Can it Run WAAK Frontend? | Can it Run WAAK Express Backend? | Can it Run PostgreSQL 16? | Can it Run Redis 7? | Overall Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Shared Linux cPanel Hosting** | YES (Static HTML/JS) | NO (Very limited; CloudLinux Passenger restricts ports/WebSockets) | **NO** (Only MySQL/MariaDB provided) | **NO** (Not supported) | **INCOMPATIBLE** for full stack |
| **Managed WordPress Hosting** | NO (WordPress only) | NO | NO | NO | **INCOMPATIBLE** |
| **GoDaddy VPS / Cloud Server (Ubuntu/Debian)** | **YES** | **YES** (Native Node 20 / Docker) | **YES** (Native PostgreSQL 16 / Docker) | **YES** (Native Redis 7 / Docker) | **100% COMPATIBLE & RECOMMENDED** |

### Recommended Production Architecture Strategy

```
               [ GoDaddy Domain Registrar: DNS Management ]
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           │                                                   │
  [ A Record: @ ]                                    [ CNAME: www ]
   Points to VPS IP                                    Points to @
           │                                                   │
           └─────────────────────────┬─────────────────────────┘
                                     │
                        [ Production Linux VPS / Cloud ]
                          (GoDaddy VPS or Cloud Host)
                                     │
                     ┌───────────────┴───────────────┐
                     │     Docker Compose Engine     │
                     │  - Nginx Reverse Proxy (SSL)  │
                     │  - React Storefront (Port 80) │
                     │  - Express API (Port 9000)    │
                     │  - PostgreSQL 16 (Port 5432)  │
                     │  - Redis 7 (Port 6379)        │
                     └───────────────────────────────┘
```

1. **If the client purchased GoDaddy Shared Hosting**:
   - The GoDaddy shared hosting plan cannot execute PostgreSQL or Redis.
   - Recommended Action: Upgrade the GoDaddy plan to a **GoDaddy Self-Managed Linux VPS** (Standard 2 vCPU / 4GB RAM running Ubuntu 22.04 LTS), or deploy the backend and database to a managed cloud VPS while keeping the domain at GoDaddy.
2. **If the client purchased a GoDaddy VPS**:
   - Install Docker and Docker Compose.
   - Deploy `docker-compose.prod.yml` and `nginx.prod.conf`.
   - Issue automated SSL via Let's Encrypt Certbot.

---

## 3. GoDaddy DNS Configuration Protocol

Before modifying any DNS records in GoDaddy:

### Step 1: Pre-Change DNS Backup
1. Log in to **GoDaddy DNS Management Console**.
2. Select the registered domain.
3. Export the existing DNS Zone File (`.txt` or BIND format) and document existing records:
   - **MX Records**: Crucial for business email (e.g., Google Workspace, Microsoft 365, GoDaddy Email). **NEVER delete or overwrite MX records.**
   - **TXT Records**: SPF, DKIM, and DMARC email authentication records. **NEVER modify without explicit mail administrator confirmation.**
   - **CNAME Records**: Existing subdomains and autodiscover records.

### Step 2: Target DNS Records for WAAK Storefront & API

| Type | Name / Host | Target Value | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (Root) | `[PRODUCTION_VPS_IP]` | 600s (10 min) | Directs `waak.co.in` to WAAK Nginx Gateway |
| **CNAME** | `www` | `@` | 3600s (1 hr) | Directs `www.waak.co.in` to root domain |
| **A** | `api` (Optional) | `[PRODUCTION_VPS_IP]` | 600s (10 min) | Optional dedicated API subdomain |

---

## 4. SSL & HTTPS Provisioning via Let's Encrypt

Once DNS points to the production server IP:
```bash
# Install Certbot
sudo apt update && sudo apt install -y certbot

# Issue Certificate for root and www
sudo certbot certonly --webroot -w /var/www/certbot \
  -d waak.co.in -d www.waak.co.in \
  --email concierge@waak.co.in \
  --agree-tos --no-eff-email

# Automated Renewal Cronjob
echo "0 3 * * * certbot renew --quiet && docker restart waak-prod-gateway" | sudo tee /etc/cron.d/certbot-renew
```
