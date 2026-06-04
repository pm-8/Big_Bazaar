import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useCartStore } from '../store/useCartStore';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pull our new decrement hook from the store
  const { items, addToCart, decrementQuantity } = useCartStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data.data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <p style={{ padding: '20px' }}>Loading store...</p>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Latest Products</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {products.map((product) => {
          
          const cartItem = items.find((item) => item.productId === product.id);

          return (
            <div key={product.id} style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{product.name}</h3>
              <p style={{ color: '#666', flexGrow: 1, margin: '0 0 15px 0' }}>{product.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>${Number(product.price).toFixed(2)}</span>
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  
                  {/* If out of stock, just show a disabled button */}
                  {product.stock === 0 ? (
                     <button disabled style={{ padding: '8px 15px', backgroundColor: '#ccc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'not-allowed', fontWeight: 'bold' }}>
                       Out of Stock
                     </button>
                  ) : 
                  
                  /* If it's IN the cart, show the Plus/Minus Controller */
                  cartItem ? (
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: '6px', overflow: 'hidden', border: '1px solid #ddd' }}>
                      <button 
                        onClick={() => decrementQuantity(product.id)}
                        style={{ padding: '8px 12px', border: 'none', backgroundColor: '#fff', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', color: '#333' }}
                      >
                        −
                      </button>
                      <span style={{ padding: '0 12px', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>
                        {cartItem.quantity}
                      </span>
                      <button 
                        onClick={() => addToCart(product)}
                        style={{ padding: '8px 12px', border: 'none', backgroundColor: '#fff', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', color: '#333' }}
                      >
                        +
                      </button>
                    </div>
                  ) : 
                  
                  /* If it's NOT in the cart yet, show the standard Add button */
                  (
                    <button 
                      onClick={() => addToCart(product)}
                      style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Add to Cart
                    </button>
                  )}

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}