import express from 'express';
import { InventoryController } from './modules/inventory/inventory.controller.js';
import { OrdersController } from './modules/orders/orders.controller.js';
import { UsersController } from './modules/users/users.controller.js';
import cors from 'cors';
import multer from 'multer';
import { requireAuth, requireAdmin } from './modules/users/auth.middleware.js';
const usersController = new UsersController();
const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // <-- Added 'PATCH' right here!
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
const inventoryController = new InventoryController();
const ordersController = new OrdersController();
const upload = multer({ storage: multer.memoryStorage() });
app.get('/api/v1/products', inventoryController.getProducts);
app.get('/api/v1/products/:id', inventoryController.getProductById);
app.post('/api/v1/products', requireAuth, requireAdmin, upload.single('image'), inventoryController.createProduct);
app.post('/api/v1/checkout', requireAuth, ordersController.checkout);
app.get('/api/v1/orders/me', requireAuth, ordersController.getMyOrders);
app.post('/api/v1/users/register', usersController.register);
app.post('/api/v1/users/login', usersController.login);
app.get('/api/v1/admin/orders', requireAuth, requireAdmin, ordersController.getAllOrders);
app.patch('/api/v1/admin/orders/:id/status', requireAuth, requireAdmin, ordersController.updateOrderStatus);
export default app;