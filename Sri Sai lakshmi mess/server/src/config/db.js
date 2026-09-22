const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('./index');

let pool = null;
let isConnected = false;

if (config.databaseUrl) {
  try {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err);
    });
  } catch (err) {
    console.error('Failed to initialize PostgreSQL pool:', err);
    pool = null;
  }
}

async function query(text, params) {
  if (!pool || !isConnected) return null;
  return pool.query(text, params);
}

async function initDb() {
  if (!pool) {
    console.log('ℹ️ DATABASE_URL not set. Running with built-in in-memory database.');
    return false;
  }

  try {
    const client = await pool.connect();
    isConnected = true;
    console.log('🐘 Connected to Neon PostgreSQL database successfully!');

    // 1. Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(120) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer',
        vehicle_number VARCHAR(40),
        is_available BOOLEAN DEFAULT true,
        total_deliveries INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        customer_name VARCHAR(120) NOT NULL,
        phone VARCHAR(25) NOT NULL,
        email VARCHAR(120),
        food_item TEXT NOT NULL,
        quantity INT DEFAULT 1,
        preferred_date VARCHAR(30),
        preferred_time VARCHAR(30),
        special_instructions TEXT,
        order_type VARCHAR(30) DEFAULT 'delivery',
        delivery_address TEXT,
        status VARCHAR(40) DEFAULT 'Order Received',
        user_id VARCHAR(64),
        payment_status VARCHAR(40) DEFAULT 'Pay on Delivery',
        payment_id VARCHAR(100),
        razorpay_order_id VARCHAR(100),
        amount INT DEFAULT 0,
        items JSONB DEFAULT '[]'::jsonb,
        delivery_partner_id VARCHAR(64),
        delivery_partner_name VARCHAR(100),
        delivery_partner_phone VARCHAR(25),
        delivered_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create menu_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        tamil_name VARCHAR(150),
        description TEXT,
        category VARCHAR(50) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        image TEXT,
        is_vegetarian BOOLEAN DEFAULT true,
        is_available BOOLEAN DEFAULT true,
        is_popular BOOLEAN DEFAULT false,
        rating NUMERIC(3, 1) DEFAULT 4.8,
        portion VARCHAR(100) DEFAULT 'Standard',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create offers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS offers (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_type VARCHAR(20) DEFAULT 'percent',
        discount_value NUMERIC(10, 2) NOT NULL,
        min_order_amount NUMERIC(10, 2) DEFAULT 0,
        valid_from VARCHAR(50),
        valid_to VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Create expenses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        category VARCHAR(80) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        date DATE NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'Cash',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Create profit_loss_records table
    await client.query(`
      CREATE TABLE IF NOT EXISTS profit_loss_records (
        id VARCHAR(64) PRIMARY KEY,
        period_type VARCHAR(20) NOT NULL,
        period_label VARCHAR(60) NOT NULL,
        revenue NUMERIC(12, 2) DEFAULT 0,
        expenses NUMERIC(12, 2) DEFAULT 0,
        net_profit NUMERIC(12, 2) DEFAULT 0,
        margin_percent NUMERIC(5, 2) DEFAULT 0,
        orders_count INT DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Auto-seed initial admin user if not exists
    const adminCheck = await client.query("SELECT id FROM users WHERE email = 'admin@srisailakshmimess.com' LIMIT 1");
    if (adminCheck.rows.length === 0) {
      // Default admin password hash for 'admin123'
      const adminHash = '$2b$10$92VCe6qjZXJntoku38KIYemjDgN9EqLOUge/mwEIh9i.C0XoPZSVa';
      await client.query(`
        INSERT INTO users (id, name, email, phone, password_hash, role, is_available, total_deliveries)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO NOTHING;
      `, ['USR-ADMIN-001', 'Mess Manager (Admin)', 'admin@srisailakshmimess.com', '9876543210', adminHash, 'admin', false, 0]);
      console.log('✅ Default admin user seeded into Neon PostgreSQL users table.');
    }

    // Seed menu items if empty
    const menuCount = await client.query('SELECT COUNT(*) FROM menu_items');
    if (parseInt(menuCount.rows[0].count, 10) === 0) {
      const menuFile = path.join(__dirname, '../data/menu.json');
      if (fs.existsSync(menuFile)) {
        try {
          const items = JSON.parse(fs.readFileSync(menuFile, 'utf-8'));
          for (const item of items) {
            await client.query(`
              INSERT INTO menu_items (id, name, tamil_name, description, category, price, image, is_vegetarian, is_available, is_popular, rating, portion)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
              ON CONFLICT (id) DO NOTHING;
            `, [
              item.id,
              item.name,
              item.tamilName || '',
              item.description || '',
              item.category || 'Meals',
              Number(item.price) || 0,
              item.image || '',
              item.isVegetarian !== false,
              item.isAvailable !== false,
              Boolean(item.isPopular),
              Number(item.rating) || 4.8,
              item.portion || 'Standard'
            ]);
          }
          console.log(`✅ Seeded ${items.length} dishes into Neon PostgreSQL menu_items table.`);
        } catch (e) {
          console.warn('Could not auto-seed menu_items:', e.message);
        }
      }
    }

    // Seed offers if empty
    const offersCount = await client.query('SELECT COUNT(*) FROM offers');
    if (parseInt(offersCount.rows[0].count, 10) === 0) {
      const offersFile = path.join(__dirname, '../data/offers.json');
      if (fs.existsSync(offersFile)) {
        try {
          const offers = JSON.parse(fs.readFileSync(offersFile, 'utf-8'));
          for (const off of offers) {
            await client.query(`
              INSERT INTO offers (id, title, description, code, discount_type, discount_value, min_order_amount, valid_from, valid_to, is_active, image_url)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
              ON CONFLICT (id) DO NOTHING;
            `, [
              off.id,
              off.title,
              off.description || '',
              (off.code || '').toUpperCase(),
              off.discountType || 'percent',
              Number(off.discountValue) || 0,
              Number(off.minOrderAmount) || 0,
              off.validFrom || null,
              off.validTo || null,
              off.isActive !== false,
              off.imageUrl || ''
            ]);
          }
          console.log(`✅ Seeded ${offers.length} offers into Neon PostgreSQL offers table.`);
        } catch (e) {
          console.warn('Could not auto-seed offers:', e.message);
        }
      }
    }

    // Seed orders from local orders.json if Neon orders table is empty
    const orderCount = await client.query('SELECT COUNT(*) FROM orders');
    if (parseInt(orderCount.rows[0].count, 10) === 0) {
      const ordersFile = path.join(__dirname, '../data/orders.json');
      if (fs.existsSync(ordersFile)) {
        try {
          const localOrders = JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));
          if (Array.isArray(localOrders) && localOrders.length > 0) {
            for (const o of localOrders) {
              await client.query(`
                INSERT INTO orders (
                  id, customer_name, phone, email, food_item, quantity,
                  preferred_date, preferred_time, special_instructions,
                  order_type, delivery_address, status, user_id,
                  payment_status, payment_id, razorpay_order_id, amount,
                  items, delivery_partner_id, delivery_partner_name, delivery_partner_phone,
                  delivered_at, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
                ON CONFLICT (id) DO NOTHING;
              `, [
                o.id,
                o.customerName || '',
                o.phone || '',
                o.email || '',
                o.foodItem || '',
                o.quantity || 1,
                o.preferredDate || '',
                o.preferredTime || '',
                o.specialInstructions || '',
                o.orderType || 'delivery',
                o.deliveryAddress || '',
                o.status || 'Order Received',
                o.userId || null,
                o.paymentStatus || 'Pay on Delivery',
                o.paymentId || null,
                o.razorpayOrderId || null,
                o.amount || 0,
                JSON.stringify(o.items || []),
                o.deliveryPartnerId || null,
                o.deliveryPartnerName || null,
                o.deliveryPartnerPhone || null,
                o.deliveredAt || null,
                o.createdAt || new Date(),
                o.updatedAt || new Date()
              ]);
            }
            console.log(`✅ Seeded ${localOrders.length} existing orders into Neon PostgreSQL orders table.`);
          }
        } catch (e) {
          console.warn('Could not auto-seed local orders:', e.message);
        }
      }
    }

    client.release();
    return true;
  } catch (error) {
    console.warn('⚠️ Warning: Failed to connect or initialize tables in Neon DB. Falling back to in-memory store.');
    console.warn('Error detail:', error.message);
    isConnected = false;
    return false;
  }
}

function getPool() {
  return isConnected ? pool : null;
}

module.exports = {
  pool,
  getPool,
  initDb,
  query,
  isDbConnected: () => isConnected
};

