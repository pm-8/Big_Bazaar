import type { Request, Response } from 'express';
import { InventoryService } from './inventory.service.js';

export class InventoryController {
  private service = new InventoryService();

  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description, price, stock } = req.body;

      const product = await this.service.addProduct({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
      });

      res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  };
//   getProducts = async(req : Request, res : Response) : 
  getProducts = async (req : Request, res : Response) : Promise<void> => {
    try{
        const products = await this.service.getAllProducts();
        res.status(200).json({ success: true, count: products.length, data: products });
    }
    catch(err){
        res.status(500).json({success : false, error : 'Failed to fetch products'});
    }
  }
}