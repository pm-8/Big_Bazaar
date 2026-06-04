import type { Request, Response } from 'express';
import { UsersService } from './users.service.js';

export class UsersController {
  private service = new UsersService();

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name, phone } = req.body;
      
      if (!email || !password || !name || !phone) {
        res.status(400).json({ success: false, error: 'All fields are required' });
        return;
      }

      const data = await this.service.register(email, password, name, phone);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const data = await this.service.login(email, password);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message });
    }
  };
}