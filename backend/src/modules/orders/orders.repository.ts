import { pool } from '../../config/db.js';

export interface OrderItemInput {
  productId: number;
  quantity: number;
  price: number;
}

export class OrdersRepository {
  async createCheckoutTransaction(customerEmail: string, totalAmount: number, items: OrderItemInput[]) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const orderRes = await client.query(
        `INSERT INTO orders (customer_email, total_amount) VALUES ($1, $2) RETURNING id, status, created_at`,
        [customerEmail, totalAmount]
      );
      const orderId = orderRes.rows[0].id;
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)`,
          [orderId, item.productId, item.quantity, item.price]
        );
        await client.query(
          `UPDATE products SET stock = stock - $1 WHERE id = $2`,
          [item.quantity, item.productId]
        );
      }
      await client.query('COMMIT');
      return orderRes.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}