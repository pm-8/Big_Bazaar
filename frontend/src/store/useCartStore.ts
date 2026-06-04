import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: { id: number; name: string; price: number }) => void;
  decrementQuantity: (productId: number) => void; // <-- New Function
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === product.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          }
          return {
            items: [...state.items, { productId: product.id, name: product.name, price: product.price, quantity: 1 }],
          };
        });
      },

      // --- NEW: Lowers quantity by 1. If it hits 0, it removes the item! ---
      decrementQuantity: (productId) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === productId);
          if (existingItem?.quantity === 1) {
            // Remove completely if they decrement a quantity of 1
            return { items: state.items.filter((item) => item.productId !== productId) };
          }
          // Otherwise, just drop the quantity by 1
          return {
            items: state.items.map((item) =>
              item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
            ),
          };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'ecommerce-cart',
    }
  )
);