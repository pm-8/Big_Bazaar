import { pool } from '../../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class UsersService {
  
  // --- 1. REGISTER ---
  async register(email: string, password: string, name: string, phone: string) {
    // 1. Check if user exists
    const checkRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (checkRes.rows.length > 0) {
      throw new Error('Email already in use');
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Save to DB
    const insertRes = await pool.query(
      'INSERT INTO users (email, password_hash, name, phone) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, phone',
      [email, passwordHash, name, phone]
    );

    const user = insertRes.rows[0];

    // 4. Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    return { user, token };
  }

  // --- 2. LOGIN ---
  async login(email: string, password: string) {
    // 1. Find the user
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = res.rows[0];

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    // Remove password hash before sending to frontend
    delete user.password_hash;
    
    return { user, token };
  }
}