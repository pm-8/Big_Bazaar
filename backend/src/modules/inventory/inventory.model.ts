import { pool } from '../../config/db.js';

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string;
}

export class InventoryRepository {
  async createProduct(product: CreateProductInput) {
    const query = `
      INSERT INTO products (name, description, price, stock, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, description, price, stock, image_url, created_at;
    `;
    
    // CRITICAL FIX: node-postgres crashes if you pass 'undefined'. 
    // We must force it to be 'null' if there is no image.
    const values = [
      product.name, 
      product.description, 
      product.price, 
      product.stock, 
      product.image_url || null 
    ];
    
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  async getProducts() {
    const query = `SELECT id, name, description, price, stock, image_url, created_at FROM products ORDER BY created_at DESC;`;
    const res = await pool.query(query);
    return res.rows;
  }

  // Moved here from the controller to keep database logic in the model!
  async getProductById(id: number) {
    const query = `SELECT * FROM products WHERE id = $1`;
    const res = await pool.query(query, [id]);
    return res.rows[0]; // Will be undefined if the product isn't found
  }
}