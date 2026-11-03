import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db';

import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import productRoutes from './routes/products';
import cartRoutes from './routes/carts';
import checkoutRoutes from './routes/checkout';
import orderRoutes from './routes/orders';
import wishlistRoutes from './routes/wishlist';
import adminRoutes from './routes/admin';
import { adminDashboardHtml } from './admin/adminHtml';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'WAAK Occasionwear Commerce API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Admin Dashboard UI (Luxury portal)
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
app.use('/admin', adminRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error occurred in Atelier service' });
});

async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  WAAK Commerce API running on http://localhost:${PORT}`);
      console.log(`  Admin Operations Console: http://localhost:${PORT}/admin`);
      console.log(`  Connected Database: PostgreSQL 16 (waak_commerce)`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
