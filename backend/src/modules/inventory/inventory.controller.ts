import type { Request, Response } from 'express';
import { InventoryService } from './inventory.service.js';
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

export class InventoryController {
  private service = new InventoryService();

  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description, price, stock } = req.body;
      let image_url: string | undefined = undefined;

      if (req.file) {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        const uploadRes = await cloudinary.uploader.upload(dataURI, { 
          folder: 'verdure_products' 
        });
        image_url = uploadRes.secure_url;
      }

      const product = await this.service.addProduct({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        ...(image_url && { image_url }) // <-- The Magic Fix
      });

      res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  };
  getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await this.service.getAllProducts();
      res.status(200).json({ success: true, count: products.length, data: products });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch products' });
    }
  };

  getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.service.getProductById(parseInt(id as string, 10));
      
      if (!product) {
        res.status(404).json({ success: false, error: 'Product not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
}