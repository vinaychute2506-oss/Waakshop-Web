import express from 'express';
import cors from 'cors';
import { config } from './config';
import { initDatabase, pool } from './db';

import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import productRoutes from './routes/products';
import cartRoutes from './routes/carts';
import checkoutRoutes from './routes/checkout';
import orderRoutes from './routes/orders';
import wishlistRoutes from './routes/wishlist';
import newsletterRoutes from './routes/newsletter';
import shippingRoutes from './routes/shipping';
import adminRoutes from './routes/admin';
import { adminDashboardHtml } from './admin/adminHtml';
import { resetRateLimits } from './middleware/rateLimiter';

const app = express();
const PORT = config.port;

// Security Headers Middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (config.nodeEnv === 'production' || config.nodeEnv === 'staging') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

// CORS Configuration with Environment-Specific Origins
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (config.corsOrigins.includes(normalizedOrigin) || config.corsOrigins.includes('*')) {
        return callback(null, true);
      }
      // Allow Vercel preview environments: https://waakshop-web-*.vercel.app
      if (/^https:\/\/waakshop-web(-[a-z0-9-]+)?\.vercel\.app$/i.test(normalizedOrigin)) {
        return callback(null, true);
      }
      console.warn(`[CORS] Blocked request from unauthorized origin: ${normalizedOrigin}`);
      return callback(null, false);
    },
    credentials: true,
  })
);

// Payload Parsing with Strict Limit and Raw Body Capture for Signature Verification
app.use(
  express.json({
    limit: '1mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
// Root API Gateway Landing (Friendly redirection & status)
app.get('/', (req, res) => {
  const acceptsHtml = req.headers.accept?.includes('text/html');
  if (acceptsHtml) {
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>WAAK Atelier — Commerce API Gateway</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #120A0B; color: #F4EFE6; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: #1E1214; border: 1px solid rgba(197, 162, 101, 0.35); border-radius: 8px; padding: 36px 32px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); box-sizing: border-box; }
          h1 { color: #C5A265; font-size: 20px; letter-spacing: 0.12em; margin: 0 0 12px; font-weight: 600; text-transform: uppercase; }
          p { color: #D8D0C5; font-size: 13px; line-height: 1.6; margin: 0 0 24px; }
          .badge { display: inline-block; padding: 4px 12px; background: rgba(37, 211, 102, 0.15); border: 1px solid #25D366; color: #25D366; border-radius: 20px; font-size: 11px; font-weight: 600; margin-bottom: 16px; letter-spacing: 0.05em; }
          .links { display: flex; flex-direction: column; gap: 10px; }
          a { display: block; padding: 12px 18px; border-radius: 4px; font-weight: 600; font-size: 12px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.08em; transition: all 0.2s ease; }
          .btn-primary { background: #5A121A; color: #FBF8F3; border: 1px solid #C5A265; }
          .btn-primary:hover { background: #7A1924; }
          .btn-secondary { background: transparent; color: #C5A265; border: 1px solid rgba(197, 162, 101, 0.4); }
          .btn-secondary:hover { background: rgba(197, 162, 101, 0.1); border-color: #C5A265; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">● API Gateway Online · Sandbox Mode</div>
          <h1>WAAK Commerce API</h1>
          <p>The headless backend service is active. To explore the storefront or manage atelier orders, select a portal below:</p>
          <div class="links">
            <a href="http://localhost:5173" class="btn-primary">Open Storefront (Port 5173)</a>
            <a href="/admin" class="btn-secondary">Open Atelier Admin Portal</a>
            <a href="/health" class="btn-secondary">View API Diagnostics (/health)</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
  return res.json({
    service: 'WAAK Occasionwear Commerce API',
    status: 'online',
    version: '1.0.0',
    port: PORT,
    endpoints: {
      storefront: 'http://localhost:5173',
      admin: '/admin',
      health: '/health',
      catalog: '/store/products',
    },
  });
});

// Health Check Endpoint (Used by Docker, Kubernetes & Load Balancers)
app.get('/health', async (_req, res) => {
  let dbHealthy = false;
  try {
    const dbTest = await pool.query('SELECT 1');
    dbHealthy = dbTest.rows.length > 0;
  } catch (e) {
    dbHealthy = false;
  }

  const statusCode = dbHealthy ? 200 : 503;
  res.status(statusCode).json({
    status: dbHealthy ? 'ok' : 'degraded',
    service: 'WAAK Occasionwear Commerce API',
    version: '1.0.0',
    environment: config.nodeEnv,
    database: dbHealthy ? 'connected' : 'unhealthy',
    isTestPaymentMode: config.razorpay.isTestMode,
    timestamp: new Date().toISOString(),
  });
});

// Admin Dashboard UI (Luxury atelier operations console)
app.get('/admin', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(adminDashboardHtml);
});

// Mount Routes
app.post('/test/reset-rate-limits', (_req, res) => {
  if (config.nodeEnv !== 'production') {
    resetRateLimits();
    return res.json({ status: 'ok', message: 'Rate limits cleared' });
  }
  res.status(403).json({ error: 'Not permitted in production' });
});
app.use('/auth', authRoutes);
app.use('/store/customers', customerRoutes);
app.use('/store/products', productRoutes);
app.use('/store/carts', cartRoutes);
app.use('/store', checkoutRoutes);
app.use('/store/orders', orderRoutes);
app.use('/store/wishlist', wishlistRoutes);
app.use('/store/newsletter', newsletterRoutes);
app.use('/store/shipping', shippingRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/admin', adminRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler (Sanitizes error details in production/staging)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const statusCode = err.status || err.statusCode || 500;
  console.error(`Unhandled server error [HTTP ${statusCode}]:`, err.message || err);
  const isProd = config.nodeEnv === 'production' || config.nodeEnv === 'staging';
  res.status(statusCode).json({
    error: isProd && statusCode === 500 ? 'Internal server error occurred in Atelier service' : err.message || 'Internal server error',
  });
});

async function startServer() {
  try {
    await initDatabase();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`  WAAK Commerce API running on http://0.0.0.0:${PORT}`);
      console.log(`  Environment: ${config.nodeEnv.toUpperCase()}`);
      console.log(`  Payment Sandbox: ${config.razorpay.isTestMode ? 'TEST MODE (Active)' : 'LIVE (Restricted)'}`);
      console.log(`  Admin Operations Console: http://localhost:${PORT}/admin`);
      console.log(`  Connected Database: PostgreSQL (Synchronized)`);
      console.log(`=======================================================`);
    });

    // Graceful Shutdown on SIGTERM / SIGINT
    const shutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Gracefully shutting down Atelier Commerce API...`);
      server.close(async () => {
        try {
          await pool.end();
          console.log('✓ Database connection pool closed cleanly.');
          process.exit(0);
        } catch (poolErr) {
          console.error('Error closing database pool:', poolErr);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
