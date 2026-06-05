import type { Request, Response } from 'express';
import { pool } from '../../config/db.js';
import { OrdersService } from './orders.service.js';
export class OrdersController {
  private service = new OrdersService();
  
  // POST: Process a Checkout
  checkout = async (req: any, res: Response): Promise<void> => {
    const client = await pool.connect(); // We use 'client' for transactions
    try {
      const userId = req.user.userId; // Pulled securely from your JWT middleware
      const { items, shippingAddress, phone, totalAmount } = req.body;

      await client.query('BEGIN'); // Start Transaction

      // 1. Create the main Order
      const orderRes = await client.query(
        'INSERT INTO orders (user_id, total_amount, shipping_address, phone_number) VALUES ($1, $2, $3, $4) RETURNING id',
        [userId, totalAmount, shippingAddress, phone]
      );
      const orderId = orderRes.rows[0].id;

      // 2. Insert every item in the cart
      for (let item of items) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
          [orderId, item.productId, item.quantity, item.price]
        );
      }

      await client.query('COMMIT'); // Lock it in!
      res.status(201).json({ success: true, orderId });
    } catch (error: any) {
      await client.query('ROLLBACK'); // Undo if it breaks
      console.error('Checkout Error:', error);
      res.status(500).json({ success: false, error: 'Checkout failed' });
    } finally {
      client.release();
    }
  };

  // GET: Fetch user's order history
  getMyOrders = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      const result = await pool.query(
        'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', 
        [userId]
      );
      res.status(200).json({ success: true, data: result.rows });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  getAllOrders = async (req: any, res: Response): Promise<void> => {
    try {
      // We use a JOIN to grab the customer's name and email alongside their order
      const result = await pool.query(`
        SELECT orders.*, users.name as customer_name, users.email as customer_email 
        FROM orders 
        JOIN users ON orders.user_id = users.id 
        ORDER BY orders.created_at DESC
      `);
      res.status(200).json({ success: true, data: result.rows });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // PATCH: Update an order's status
  updateOrderStatus = async (req: any, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
      res.status(200).json({ success: true, message: 'Order status updated successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.service.getOrderById(parseInt((id as string), 10));
      
      if (!order) {
        res.status(404).json({ success: false, error: 'Order not found' });
        return;
      }

      res.status(200).json({ success: true, data: order });
    } catch (error: any) {
      console.error('Fetch Order Error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch order details' });
    }
  };
}