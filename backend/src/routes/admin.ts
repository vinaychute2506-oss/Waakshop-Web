import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { pool } from '../db';
import { adminAuth } from '../middleware/auth';
import { uploadImageBuffer, isCloudinaryConfigured } from '../services/cloudinary';

import { config } from '../config';

const router = Router();
const JWT_SECRET = config.jwtSecret;

import { loginRateLimiter, resetRateLimits } from '../middleware/rateLimiter';

// POST /admin/rate-limits/reset
router.post('/rate-limits/reset', (_req: Request, res: Response) => {
  resetRateLimits();
  res.json({ success: true, message: 'Rate limits cleared' });
});

// POST /admin/auth/token
router.post('/auth/token', loginRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    // Production credential hardening guard
    if (config.admin.defaultPasswordBlocked && password === 'waakAdmin2026!') {
      console.warn(`[Admin Auth] Rejected default development credentials for '${cleanEmail}' in production/staging mode.`);
      res.status(403).json({
        error: 'Default development credentials prohibited in production/staging mode. Set ADMIN_PASSWORD in environment.',
      });
      return;
    }

    const result = await pool.query('SELECT * FROM admin_users WHERE email = $1', [cleanEmail]);
    if (result.rows.length === 0) {
      console.warn(`[Admin Auth] Failed login attempt: No admin account found with email '${cleanEmail}'.`);
      res.status(401).json({ error: 'Invalid admin credentials' });
      return;
    }

    const admin = result.rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      console.warn(`[Admin Auth] Failed login attempt: Incorrect password for '${cleanEmail}'.`);
      res.status(401).json({ error: 'Invalid admin credentials' });
      return;
    }

    const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    console.log(`✓ [Admin Auth] Admin session created successfully for '${cleanEmail}'`);
    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error('[Admin Auth] Unexpected server error during authentication:', error.message || error);
    res.status(500).json({ error: 'Admin login failed due to an unexpected server error' });
  }
});

// GET /admin/stats
router.get('/stats', adminAuth, async (_req: Request, res: Response) => {
  try {
    const revenueRes = await pool.query(
      "SELECT COALESCE(SUM(total), 0) as total_revenue, COUNT(*) as total_orders FROM orders WHERE status = 'paid' OR status = 'processing' OR status = 'shipped' OR status = 'delivered'"
    );

    const customerRes = await pool.query('SELECT COUNT(*) as total_customers FROM customers');

    const lowStockRes = await pool.query(
      `SELECT p.title, v.size, v.stock_quantity, v.sku
       FROM product_variants v
       JOIN products p ON p.id = v.product_id
       WHERE v.stock_quantity <= 4
       ORDER BY v.stock_quantity ASC`
    );

    res.json({
      total_revenue: parseInt(revenueRes.rows[0].total_revenue, 10),
      total_orders: parseInt(revenueRes.rows[0].total_orders, 10),
      total_customers: parseInt(customerRes.rows[0].total_customers, 10),
      low_stock_items: lowStockRes.rows,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// GET /admin/orders
router.get('/orders', adminAuth, async (_req: Request, res: Response) => {
  try {
    const ordersRes = await pool.query(
      `SELECT o.*,
         COALESCE(
           json_agg(
             json_build_object(
               'id', oi.id,
               'title', oi.title,
               'size', oi.size,
               'quantity', oi.quantity,
               'unit_price', oi.unit_price,
               'total', oi.total,
               'thumbnail', oi.thumbnail
             )
           ) FILTER (WHERE oi.id IS NOT NULL), '[]'
         ) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );

    res.json({ orders: ordersRes.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PUT /admin/orders/:id/status
router.put('/orders/:id/status', adminAuth, async (req: Request, res: Response) => {
  try {
    const { status, fulfillment_status } = req.body;
    const result = await pool.query(
      `UPDATE orders
       SET status = COALESCE($1, status),
           fulfillment_status = COALESCE($2, fulfillment_status),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, fulfillment_status, req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ order: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Configure Multer for secure, memory-buffered image uploads
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per image max
    files: 10,                 // Up to 10 images per batch
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
});

// POST /admin/upload/images
router.post('/upload/images', adminAuth, (req: Request, res: Response) => {
  imageUpload.array('images', 10)(req, res, async (err: any) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ error: 'File size exceeds maximum allowable limit of 5 MB per image.' });
        return;
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        res.status(400).json({ error: 'Maximum 10 images can be uploaded simultaneously.' });
        return;
      }
      res.status(400).json({ error: err.message || 'Image upload validation failed.' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No image files provided for upload.' });
      return;
    }

    // Verify magic bytes
    const isValidImageMagic = (buf: Buffer): boolean => {
      if (!buf || buf.length < 4) return false;
      // JPEG: FF D8 FF
      if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
      // PNG: 89 50 4E 47
      if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
      // WEBP: RIFF ... WEBP
      if (
        buf.length >= 12 &&
        buf.toString('ascii', 0, 4) === 'RIFF' &&
        buf.toString('ascii', 8, 12) === 'WEBP'
      ) return true;
      return false;
    };

    try {
      const results = [];
      for (const file of files) {
        if (!isValidImageMagic(file.buffer)) {
          res.status(400).json({
            error: `File '${file.originalname}' has invalid image headers and cannot be accepted.`,
          });
          return;
        }
        const uploaded = await uploadImageBuffer(file.buffer, file.originalname);
        results.push(uploaded);
      }

      res.json({
        success: true,
        count: results.length,
        isCloudinaryConfigured: isCloudinaryConfigured(),
        images: results,
      });
    } catch (uploadError: any) {
      console.error('Image upload processing error:', uploadError);
      res.status(500).json({ error: uploadError.message || 'Failed to process and store image upload.' });
    }
  });
});

// GET /admin/products
router.get('/products', adminAuth, async (req: Request, res: Response) => {
  try {
    const { search, category, occasion, status, stock, sort } = req.query;

    let query = `
      SELECT p.*,
        COALESCE(SUM(v.stock_quantity), 0)::integer as total_inventory,
        (SELECT COUNT(*)::integer FROM order_items oi WHERE oi.product_id = p.id) as order_count,
        COALESCE(
          json_agg(
            json_build_object(
              'id', v.id,
              'sku', v.sku,
              'size', v.size,
              'stock_quantity', v.stock_quantity,
              'reserved_quantity', v.reserved_quantity,
              'price', COALESCE(v.price, p.price)
            ) ORDER BY v.size ASC
          ) FILTER (WHERE v.id IS NOT NULL), '[]'
        ) as variants
      FROM products p
      LEFT JOIN product_variants v ON v.product_id = p.id
    `;

    const whereClauses: string[] = [];
    const values: any[] = [];

    if (search && typeof search === 'string' && search.trim()) {
      values.push(`%${search.trim().toLowerCase()}%`);
      whereClauses.push(`(LOWER(p.title) LIKE $${values.length} OR LOWER(p.id) LIKE $${values.length} OR LOWER(p.description) LIKE $${values.length})`);
    }

    if (category && category !== 'All' && category !== 'all') {
      values.push(category);
      whereClauses.push(`p.category = $${values.length}`);
    }

    if (occasion && occasion !== 'All' && occasion !== 'all') {
      values.push(occasion);
      whereClauses.push(`p.occasion = $${values.length}`);
    }

    if (status === 'published') {
      whereClauses.push('COALESCE(p.is_published, TRUE) = TRUE');
    } else if (status === 'draft') {
      whereClauses.push('COALESCE(p.is_published, TRUE) = FALSE');
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    query += ' GROUP BY p.id';

    // Having clause for stock filtering if requested
    if (stock === 'in_stock') {
      query += ' HAVING COALESCE(SUM(v.stock_quantity), 0) > 4';
    } else if (stock === 'low_stock') {
      query += ' HAVING COALESCE(SUM(v.stock_quantity), 0) > 0 AND COALESCE(SUM(v.stock_quantity), 0) <= 4';
    } else if (stock === 'out_of_stock') {
      query += ' HAVING COALESCE(SUM(v.stock_quantity), 0) = 0';
    }

    if (sort === 'price-asc') {
      query += ' ORDER BY p.price ASC';
    } else if (sort === 'price-desc') {
      query += ' ORDER BY p.price DESC';
    } else if (sort === 'title-asc') {
      query += ' ORDER BY p.title ASC';
    } else {
      query += ' ORDER BY p.created_at DESC';
    }

    const result = await pool.query(query, values);
    res.json({ products: result.rows, count: result.rows.length });
  } catch (error: any) {
    console.error('Failed to fetch admin products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /admin/products/:id
router.get('/products/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const productId = String(req.params.id);
    const query = `
      SELECT p.*,
        COALESCE(SUM(v.stock_quantity), 0)::integer as total_inventory,
        (SELECT COUNT(*)::integer FROM order_items oi WHERE oi.product_id = p.id) as order_count,
        COALESCE(
          json_agg(
            json_build_object(
              'id', v.id,
              'sku', v.sku,
              'size', v.size,
              'stock_quantity', v.stock_quantity,
              'reserved_quantity', v.reserved_quantity,
              'price', COALESCE(v.price, p.price)
            ) ORDER BY v.size ASC
          ) FILTER (WHERE v.id IS NOT NULL), '[]'
        ) as variants
      FROM products p
      LEFT JOIN product_variants v ON v.product_id = p.id
      WHERE p.id = $1
      GROUP BY p.id
    `;
    const result = await pool.query(query, [productId]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ product: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

// POST /admin/products
router.post('/products', adminAuth, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const {
      id: customId,
      title,
      subtitle = '',
      description = '',
      price,
      original_price,
      category,
      occasion,
      collection = '',
      is_new_arrival = false,
      is_bestseller = false,
      on_sale = false,
      is_published = true,
      thumbnail,
      images = [],
      variants = [],
    } = req.body;

    // Strict Validations
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Product title is required' });
      return;
    }

    const parsedPrice = parseInt(price, 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      res.status(400).json({ error: 'Valid positive price in INR is required' });
      return;
    }

    let parsedOriginalPrice: number | null = null;
    if (original_price !== undefined && original_price !== null && original_price !== '') {
      parsedOriginalPrice = parseInt(original_price, 10);
      if (isNaN(parsedOriginalPrice) || parsedOriginalPrice < 0) {
        res.status(400).json({ error: 'Original/compare-at price must be a non-negative number' });
        return;
      }
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      res.status(400).json({ error: 'Category is required' });
      return;
    }

    if (!occasion || typeof occasion !== 'string' || !occasion.trim()) {
      res.status(400).json({ error: 'Occasion is required' });
      return;
    }

    if (!thumbnail || typeof thumbnail !== 'string' || !thumbnail.trim()) {
      res.status(400).json({ error: 'Product thumbnail URL or path is required' });
      return;
    }

    // Validate and generate product ID
    let productId = '';
    if (customId && typeof customId === 'string' && customId.trim()) {
      productId = customId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    } else {
      productId = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    if (!productId) {
      productId = `waak-${Date.now().toString(36)}`;
    }

    // Check for ID collision
    const existingProduct = await client.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (existingProduct.rows.length > 0) {
      res.status(409).json({ error: `A product with ID '${productId}' already exists. Choose a unique handle/SKU.` });
      return;
    }

    // Size variants preparation & validation
    const standardSizes = ['36', '38', '40', '42', '44'];
    let variantList: Array<{ size: string; stock_quantity: number; price?: number }> = [];

    if (Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        if (!v.size || typeof v.size !== 'string') {
          res.status(400).json({ error: 'Variant size string is required' });
          return;
        }
        const stock = parseInt(v.stock_quantity, 10);
        if (isNaN(stock) || stock < 0) {
          res.status(400).json({ error: `Stock quantity for size ${v.size} cannot be negative` });
          return;
        }
        variantList.push({
          size: v.size.trim(),
          stock_quantity: stock,
          price: v.price !== undefined ? parseInt(v.price, 10) : parsedPrice,
        });
      }
    } else {
      // Default standard sizes with 0 initial stock
      variantList = standardSizes.map((sz) => ({ size: sz, stock_quantity: 0, price: parsedPrice }));
    }

    // Verify no SKU collision across all variants
    for (const v of variantList) {
      const sku = `WAAK-${productId.toUpperCase()}-${v.size}`;
      const skuCheck = await client.query('SELECT id FROM product_variants WHERE sku = $1', [sku]);
      if (skuCheck.rows.length > 0) {
        res.status(409).json({ error: `Duplicate SKU detected: ${sku} is already registered` });
        return;
      }
    }

    // Atomic Insertion Transaction
    await client.query('BEGIN');

    const productInsert = `
      INSERT INTO products (
        id, title, subtitle, description, price, original_price, category, occasion,
        collection, is_new_arrival, is_bestseller, on_sale, is_published,
        thumbnail, images, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      RETURNING *
    `;

    const productRes = await client.query(productInsert, [
      productId,
      title.trim(),
      subtitle.trim(),
      description.trim(),
      parsedPrice,
      parsedOriginalPrice,
      category.trim(),
      occasion.trim(),
      collection.trim(),
      Boolean(is_new_arrival),
      Boolean(is_bestseller),
      Boolean(on_sale),
      Boolean(is_published),
      thumbnail.trim(),
      Array.isArray(images) ? images : [thumbnail.trim()],
    ]);

    const createdVariants = [];
    for (const v of variantList) {
      const variantId = `var_${productId}_${v.size}`;
      const sku = `WAAK-${productId.toUpperCase()}-${v.size}`;
      const varRes = await client.query(
        `INSERT INTO product_variants (id, product_id, title, sku, size, stock_quantity, reserved_quantity, price)
         VALUES ($1, $2, $3, $4, $5, $6, 0, $7)
         RETURNING *`,
        [variantId, productId, `Size ${v.size}`, sku, v.size, v.stock_quantity, v.price || parsedPrice]
      );
      createdVariants.push(varRes.rows[0]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      product: {
        ...productRes.rows[0],
        variants: createdVariants,
      },
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Failed to create product:', error);
    res.status(500).json({ error: error.message || 'Failed to create product' });
  } finally {
    client.release();
  }
});

// PUT /admin/products/:id
router.put('/products/:id', adminAuth, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const productId = String(req.params.id);

    // Check product existence
    const existingRes = await client.query('SELECT * FROM products WHERE id = $1', [productId]);
    if (existingRes.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const {
      title,
      subtitle,
      description,
      price,
      original_price,
      category,
      occasion,
      collection,
      is_new_arrival,
      is_bestseller,
      on_sale,
      is_published,
      thumbnail,
      images,
      variants,
    } = req.body;

    let parsedPrice: number | undefined;
    if (price !== undefined) {
      parsedPrice = parseInt(price, 10);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        res.status(400).json({ error: 'Price must be a positive integer in INR' });
        return;
      }
    }

    let parsedOriginalPrice: number | null | undefined;
    if (original_price !== undefined) {
      if (original_price === null || original_price === '') {
        parsedOriginalPrice = null;
      } else {
        parsedOriginalPrice = parseInt(original_price, 10);
        if (isNaN(parsedOriginalPrice) || parsedOriginalPrice < 0) {
          res.status(400).json({ error: 'Original price cannot be negative' });
          return;
        }
      }
    }

    // Validate variants if provided
    if (Array.isArray(variants)) {
      for (const v of variants) {
        const stock = parseInt(v.stock_quantity, 10);
        if (isNaN(stock) || stock < 0) {
          res.status(400).json({ error: `Stock quantity for size ${v.size} cannot be negative` });
          return;
        }
      }
    }

    await client.query('BEGIN');

    // Update product record
    const updateProductQuery = `
      UPDATE products SET
        title = COALESCE($1, title),
        subtitle = COALESCE($2, subtitle),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        original_price = CASE WHEN $5::boolean THEN $6::integer ELSE original_price END,
        category = COALESCE($7, category),
        occasion = COALESCE($8, occasion),
        collection = COALESCE($9, collection),
        is_new_arrival = COALESCE($10, is_new_arrival),
        is_bestseller = COALESCE($11, is_bestseller),
        on_sale = COALESCE($12, on_sale),
        is_published = COALESCE($13, is_published),
        thumbnail = COALESCE($14, thumbnail),
        images = COALESCE($15, images),
        updated_at = NOW()
      WHERE id = $16
      RETURNING *
    `;

    const productRes = await client.query(updateProductQuery, [
      title ? title.trim() : null,
      subtitle !== undefined ? subtitle.trim() : null,
      description !== undefined ? description.trim() : null,
      parsedPrice,
      original_price !== undefined,
      parsedOriginalPrice,
      category ? category.trim() : null,
      occasion ? occasion.trim() : null,
      collection !== undefined ? collection.trim() : null,
      is_new_arrival !== undefined ? Boolean(is_new_arrival) : null,
      is_bestseller !== undefined ? Boolean(is_bestseller) : null,
      on_sale !== undefined ? Boolean(on_sale) : null,
      is_published !== undefined ? Boolean(is_published) : null,
      thumbnail ? thumbnail.trim() : null,
      Array.isArray(images) ? images : null,
      productId,
    ]);

    // Upsert variants if provided
    if (Array.isArray(variants)) {
      for (const v of variants) {
        const stock = parseInt(v.stock_quantity, 10);
        const variantPrice = v.price !== undefined ? parseInt(v.price, 10) : productRes.rows[0].price;
        const sku = `WAAK-${productId.toUpperCase()}-${v.size}`;
        const variantId = v.id || `var_${productId}_${v.size}`;

        // Check SKU collision with other products
        const skuConflict = await client.query(
          'SELECT id FROM product_variants WHERE sku = $1 AND product_id != $2',
          [sku, productId]
        );
        if (skuConflict.rows.length > 0) {
          throw new Error(`SKU conflict: '${sku}' is assigned to another garment`);
        }

        await client.query(
          `INSERT INTO product_variants (id, product_id, title, sku, size, stock_quantity, reserved_quantity, price)
           VALUES ($1, $2, $3, $4, $5, $6, 0, $7)
           ON CONFLICT (sku) DO UPDATE SET
             stock_quantity = EXCLUDED.stock_quantity,
             price = EXCLUDED.price`,
          [variantId, productId, `Size ${v.size}`, sku, v.size, stock, variantPrice]
        );
      }
    }

    await client.query('COMMIT');

    // Fetch full updated product with variants
    const fullRes = await pool.query(
      `SELECT p.*,
        COALESCE(SUM(v.stock_quantity), 0)::integer as total_inventory,
        COALESCE(
          json_agg(
            json_build_object(
              'id', v.id,
              'sku', v.sku,
              'size', v.size,
              'stock_quantity', v.stock_quantity,
              'reserved_quantity', v.reserved_quantity,
              'price', COALESCE(v.price, p.price)
            ) ORDER BY v.size ASC
          ) FILTER (WHERE v.id IS NOT NULL), '[]'
        ) as variants
      FROM products p
      LEFT JOIN product_variants v ON v.product_id = p.id
      WHERE p.id = $1
      GROUP BY p.id`,
      [productId]
    );

    res.json({ success: true, product: fullRes.rows[0] });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Failed to update product:', error);
    res.status(500).json({ error: error.message || 'Failed to update product' });
  } finally {
    client.release();
  }
});

// PATCH /admin/products/:id/publish
router.patch('/products/:id/publish', adminAuth, async (req: Request, res: Response) => {
  try {
    const productId = String(req.params.id);
    const { is_published } = req.body;
    if (is_published === undefined) {
      res.status(400).json({ error: 'is_published boolean field is required' });
      return;
    }

    const result = await pool.query(
      'UPDATE products SET is_published = $1, updated_at = NOW() WHERE id = $2 RETURNING id, is_published, title',
      [Boolean(is_published), productId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ success: true, product: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update publication status' });
  }
});

// DELETE /admin/products/:id
router.delete('/products/:id', adminAuth, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const productId = String(req.params.id);

    // 1. Verify existence
    const productCheck = await client.query('SELECT title FROM products WHERE id = $1', [productId]);
    if (productCheck.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // 2. Safeguard: Check for historical orders
    const orderCheck = await client.query(
      'SELECT COUNT(*)::integer as count FROM order_items WHERE product_id = $1',
      [productId]
    );

    const orderCount = orderCheck.rows[0].count;
    if (orderCount > 0) {
      res.status(409).json({
        error: `Cannot permanently delete garment '${productCheck.rows[0].title}' because it is linked to ${orderCount} historical client order(s). To remove it from the boutique storefront while preserving financial and audit history, please unpublish it instead.`,
        has_orders: true,
        order_count: orderCount,
      });
      return;
    }

    // 3. Safe cascade deletion for un-ordered products
    await client.query('BEGIN');
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM cart_items WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM wishlists WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM products WHERE id = $1', [productId]);
    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Garment '${productCheck.rows[0].title}' removed cleanly from catalogue.`,
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Failed to delete product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  } finally {
    client.release();
  }
});

// PUT /admin/products/:id/stock
router.put('/products/:id/stock', adminAuth, async (req: Request, res: Response) => {
  try {
    const { variant_id, stock_quantity } = req.body;
    if (!variant_id || stock_quantity === undefined) {
      res.status(400).json({ error: 'variant_id and stock_quantity required' });
      return;
    }

    await pool.query(
      'UPDATE product_variants SET stock_quantity = $1 WHERE id = $2 AND product_id = $3',
      [parseInt(stock_quantity, 10), variant_id, String(req.params.id)]
    );

    res.json({ success: true, variant_id, stock_quantity });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// GET /admin/customers
router.get('/customers', adminAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.email, c.first_name, c.last_name, c.phone, c.created_at,
         COUNT(DISTINCT o.id) as order_count,
         COALESCE(SUM(o.total), 0) as lifetime_spend
       FROM customers c
       LEFT JOIN orders o ON o.customer_id = c.id
       GROUP BY c.id
       ORDER BY c.created_at DESC`
    );

    res.json({ customers: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

export default router;
