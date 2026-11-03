# ==============================================================================
# WAAK Commerce API - Production Dockerfile (Multi-Stage Build)
# ==============================================================================

# Stage 1: Build & Compilation
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy source code and database migrations
COPY src/ ./src/

# Compile TypeScript and copy migration files to dist
RUN npm run build

# Stage 2: Production Execution Image
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=9000

# Install production dependencies only (no devDependencies)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled files and migrations from builder
COPY --from=builder /app/dist ./dist

# Create dedicated non-root execution user and assign ownership
RUN chown -R node:node /app
USER node

# Expose internal API port
EXPOSE 9000

# Health Check against internal HTTP health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:9000/health || exit 1

# Start production server
CMD ["node", "dist/index.js"]
