const { Pool } = require('pg');
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
        status VARCHAR(40) DEFAULT 'Enquiry Received',
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
  isDbConnected: () => isConnected
};
