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
  async getOrderById(orderId: number) {
    const query = `
      SELECT 
        o.id, 
        o.total_amount, 
        o.shipping_address as address, 
        o.phone_number as phone, 
        o.status, 
        o.created_at,
        u.name as customer_name, 
        u.email as customer_email,
        COALESCE(
          json_agg(
            json_build_object(
              'product_name', p.name,
              'quantity', oi.quantity,
              'price', oi.price_at_purchase
            )
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'
        ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1
      GROUP BY o.id, u.id;
    `;
    const res = await pool.query(query, [orderId]);
    return res.rows[0]; // Returns undefined if the order doesn't exist
  }
}