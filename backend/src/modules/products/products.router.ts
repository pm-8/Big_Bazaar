import { Router, type Request, type Response } from 'express';
import { pool } from '../../config/db.js';

const router = Router();
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;