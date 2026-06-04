import { pool } from '../../config/db.js';

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export class InventoryRepository {
  async createProduct(product: CreateProductInput) {
    const query = `
      INSERT INTO products (name, description, price, stock)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, description, price, stock, created_at;
    `;
    const values = [product.name, product.description, product.price, product.stock];
    
    const res = await pool.query(query, values);
    console.log(res.rows);
    return res.rows[0];
  }
  async getProducts(){
    const query = `SELECT id, name, description, price, stock, created_at FROM products ORDER BY created_at DESC;`;
    const res = await pool.query(query);
    return res.rows;
  }
}