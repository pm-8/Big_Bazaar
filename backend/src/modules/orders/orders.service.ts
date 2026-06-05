import { OrdersRepository } from './orders.repository.js';
import { InventoryRepository } from '../inventory/inventory.model.js';

interface CheckoutRequest {
  customerEmail: string;
  items: { productId: number; quantity: number }[];
}
export class OrdersService {
  private ordersRepo = new OrdersRepository();
  private inventoryRepo = new InventoryRepository();
  async processCheckout(data: CheckoutRequest) {
    if (!data.items || data.items.length === 0) throw new Error('Cart is empty.');
    const allProducts = await this.inventoryRepo.getProducts();
    let totalAmount = 0;
    const validatedItems = [];
    for (const cartItem of data.items) {
      const dbProduct = allProducts.find((p : any) => p.id === cartItem.productId);
      if (!dbProduct) throw new Error(`Product ID ${cartItem.productId} not found.`);
      if (dbProduct.stock < cartItem.quantity) throw new Error(`Not enough stock for ${dbProduct.name}.`);
      const lineTotal = Number(dbProduct.price) * cartItem.quantity;
      totalAmount += lineTotal;
      validatedItems.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        price: Number(dbProduct.price)
      });
    }
    return await this.ordersRepo.createCheckoutTransaction(
      data.customerEmail, 
      totalAmount, 
      validatedItems
    );
  }
  async getOrderById(orderId: number) {
    return await this.ordersRepo.getOrderById(orderId);
  }
}