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
import adminRoutes from './routes/admin';
import { adminDashboardHtml } from './admin/adminHtml';

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
      if (config.corsOrigins.includes(origin) || config.corsOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
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
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

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
app.use('/auth', authRoutes);
app.use('/store/customers', customerRoutes);
app.use('/store/products', productRoutes);
app.use('/store/carts', cartRoutes);
app.use('/store', checkoutRoutes);
app.use('/store/orders', orderRoutes);
app.use('/store/wishlist', wishlistRoutes);
app.use('/store/newsletter', newsletterRoutes);
app.use('/admin', adminRoutes);

// Global Error Handler (Sanitizes error details in production/staging)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err.message || err);
  const isProd = config.nodeEnv === 'production' || config.nodeEnv === 'staging';
  res.status(500).json({
    error: isProd ? 'Internal server error occurred in Atelier service' : err.message || 'Internal server error',
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
