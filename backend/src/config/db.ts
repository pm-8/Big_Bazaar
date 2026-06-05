import { Pool } from 'pg';
import 'dotenv/config'; // Ensure env variables are loaded

// 1. Configure the PostgreSQL Connection Pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

// 2. Database Initialization Script
export const initDatabase = async (): Promise<void> => {
  try {
    // Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'USER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Products Table (Fixed: 'name' instead of 'title')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        image_url VARCHAR(512),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Main Orders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        total_amount DECIMAL(10, 2) NOT NULL,
        shipping_address TEXT NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Order Items Table (Linked to Orders and Products)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id),
        quantity INT NOT NULL,
        price_at_purchase DECIMAL(10, 2) NOT NULL
      );
    `);

    console.log('Database tables verified/created successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
    // Rethrow the error so the server boot process knows it failed
    throw error; 
  }
};