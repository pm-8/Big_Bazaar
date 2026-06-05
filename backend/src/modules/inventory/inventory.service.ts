//inventory.service.ts
import { InventoryRepository, type CreateProductInput } from './inventory.model.js';

export class InventoryService {
  private repository = new InventoryRepository();

  async addProduct(input: CreateProductInput) {
    if (!input.name || input.name.trim() === '') {
      throw new Error('Product name is required.');
    }
    if (input.price <= 0) {
      throw new Error('Price must be greater than zero.');
    }
    if (input.stock < 0) {
      throw new Error('Stock cannot be negative.');
    }

    return await this.repository.createProduct(input);
  }
  async getAllProducts(){
    return await this.repository.getProducts();
  }
}