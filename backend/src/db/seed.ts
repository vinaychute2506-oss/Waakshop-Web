import { pool, initDatabase } from './index';
import bcrypt from 'bcryptjs';

export async function seedDatabase(skipInit = false): Promise<void> {
  if (!skipInit) {
    await initDatabase();
  }
  const client = await pool.connect();

  try {
    console.log('Seeding WAAK commerce database...');

    // 1. Seed Products
    const products = [
      {
        id: 'waak-01',
        title: 'The Ivory Zardozi Sherwani',
        subtitle: 'Handcrafted Heritage Couture with Fine Zardozi Wirework',
        description: 'A masterpiece of royal Indian occasionwear, spun from pure Banarasi silk and embellished with meticulous antique gold zardozi wirework along the mandarin collar and cuffs. Tailored to an architectural silhouette for the quintessential modern groom.',
        price: 49500,
        category: 'Sherwanis',
        occasion: 'Wedding',
        is_new_arrival: true,
        is_bestseller: true,
        on_sale: false,
        thumbnail: '/assets/products/ivory-sherwani.jpg',
        images: ['/assets/products/ivory-sherwani.jpg', '/assets/products/ivory-sherwani.jpg'],
      },
      {
        id: 'waak-02',
        title: 'Midnight Velvet Sherwani',
        subtitle: 'Regal Dark Navy Micro-Velvet with Tone-on-Tone Threadwork',
        description: 'Exquisitely sculpted in deep midnight-blue micro-velvet, featuring discreet tone-on-tone resham threadwork that catches the light with subtle sophistication. Paired with churidar trousers for high-evening receptions.',
        price: 54500,
        category: 'Sherwanis',
        occasion: 'Reception',
        is_new_arrival: true,
        is_bestseller: false,
        on_sale: false,
        thumbnail: '/assets/products/midnight-sherwani.jpg',
        images: ['/assets/products/midnight-sherwani.jpg'],
      },
      {
        id: 'waak-03',
        title: 'Mauve Raw Silk Bandhgala',
        subtitle: 'Contemporary Jodhpuri Tailoring in Dusty Rose Raw Silk',
        description: 'Understated luxury defined. Cut from crisp Bhagalpur raw silk in a muted dusty mauve tone, accented with custom antique-brass buttons crafted in Varanasi. An elevated statement for Sangeet evenings and cocktail galas.',
        price: 38500,
        category: 'Indo-Western',
        occasion: 'Sangeet',
        is_new_arrival: true,
        is_bestseller: false,
        on_sale: false,
        thumbnail: '/assets/products/mauve-bandhgala.jpg',
        images: ['/assets/products/mauve-bandhgala.jpg'],
      },
      {
        id: 'waak-04',
        title: 'Emerald Tussar Silk Kurta',
        subtitle: 'Artisanal Festive Kurta Set with Chanderi Dupatta',
        description: 'Deep jewel-toned emerald green Tussar silk kurta set highlighted with fine needlework details along the placket. Includes tailored ivory churidar and a matching Chanderi silk stole.',
        price: 24500,
        category: 'Kurta Sets',
        occasion: 'Mehendi',
        is_new_arrival: true,
        is_bestseller: true,
        on_sale: true,
        thumbnail: '/assets/products/emerald-kurta.jpg',
        images: ['/assets/products/emerald-kurta.jpg'],
      },
    ];

    for (const p of products) {
      await client.query(
        `INSERT INTO products (id, title, subtitle, description, price, category, occasion, is_new_arrival, is_bestseller, on_sale, thumbnail, images, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
         ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            subtitle = EXCLUDED.subtitle,
            description = EXCLUDED.description,
            price = EXCLUDED.price,
            category = EXCLUDED.category,
            occasion = EXCLUDED.occasion,
            is_new_arrival = EXCLUDED.is_new_arrival,
            is_bestseller = EXCLUDED.is_bestseller,
            on_sale = EXCLUDED.on_sale,
            thumbnail = EXCLUDED.thumbnail,
            images = EXCLUDED.images,
            updated_at = NOW()`,
        [p.id, p.title, p.subtitle, p.description, p.price, p.category, p.occasion, p.is_new_arrival, p.is_bestseller, p.on_sale, p.thumbnail, p.images]
      );

      // Seed Variants (sizes 36, 38, 40, 42, 44)
      const sizes = ['36', '38', '40', '42', '44'];
      const stockCounts: Record<string, number> = { '36': 0, '38': 6, '40': 10, '42': 8, '44': 4 };

      for (const size of sizes) {
        const variantId = `var_${p.id}_${size}`;
        const sku = `WAAK-${p.id.toUpperCase()}-${size}`;
        await client.query(
          `INSERT INTO product_variants (id, product_id, title, sku, size, stock_quantity, reserved_quantity, price)
           VALUES ($1, $2, $3, $4, $5, $6, 0, $7)
           ON CONFLICT (sku) DO UPDATE SET
              stock_quantity = EXCLUDED.stock_quantity,
              price = EXCLUDED.price`,
          [variantId, p.id, `Size ${size}`, sku, size, stockCounts[size], p.price]
        );
      }
    }
    console.log('✓ Products & Variants seeded successfully');

    // 2. Seed Admin User
    const adminPassword = process.env.ADMIN_PASSWORD || 'waakAdmin2026!';
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    await client.query(
      `INSERT INTO admin_users (id, email, password_hash, first_name, last_name, role)
       VALUES ('admin_waak_01', 'atelier@waak.in', $1, 'WAAK', 'Atelier Director', 'admin')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [adminPasswordHash]
    );
    console.log('✓ Admin user seeded (atelier@waak.in)');

    // 3. Seed Demo Customer & Address
    const customerPasswordHash = await bcrypt.hash('waakClient2026!', 10);
    await client.query(
      `INSERT INTO customers (id, email, password_hash, first_name, last_name, phone)
       VALUES ('cus_demo_01', 'client@waak.in', $1, 'Aditya', 'Singhania', '+91 98765 43210')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [customerPasswordHash]
    );

    await client.query(
      `INSERT INTO customer_addresses (id, customer_id, first_name, last_name, address_1, address_2, city, state, postal_code, country_code, phone, is_default)
       VALUES ('addr_demo_01', 'cus_demo_01', 'Aditya', 'Singhania', '14, Golf Links Enclave', 'Bespoke Pavilion Suite', 'New Delhi', 'Delhi', '110003', 'IN', '+91 98765 43210', true)
       ON CONFLICT (id) DO NOTHING`
    );
    console.log('✓ Demo customer and address seeded (client@waak.in)');

  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✓ Seed finished successfully');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
