import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // <-- Added Link for navigation
import { api } from '../lib/api';
import { useCartStore } from '../store/useCartStore';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string; // <-- Added image_url
}

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-[3px] border-[#354024] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#889063] text-xs font-semibold tracking-[0.25em] uppercase">Loading Products…</p>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mb-8">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#889063] mb-1">Collection</p>
        <h1 className="text-4xl font-bold text-[#354024]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Latest Products
        </h1>
        <div className="mt-3 w-14 h-1 bg-gradient-to-r from-[#354024] to-[#889063] rounded-full" />
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-6">
        {products.map((product, i) => {
          const cartItem = items.find((item) => item.productId === product.id);

          return (
            <div
              key={product.id}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-[#CFBB99]/60
                shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden
                hover:-translate-y-1"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              
              {/* --- NEW IMAGE DISPLAY WRAPPED IN A LINK --- */}
              <Link to={`/product/${product.id}`} className="block w-full h-48 relative bg-[#E5D7C4]/30 overflow-hidden cursor-pointer">
                <img 
                  src={product.image_url || 'https://placehold.co/600x400/E5D7C4/889063?text=Verdure'} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Link>

              <div className="h-1.5 w-full bg-gradient-to-r from-[#354024] via-[#889063] to-[#CFBB99]" />

              <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#4C3D19] mb-2 leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {/* Make the title a clickable link too */}
                    <Link to={`/product/${product.id}`} className="hover:text-[#889063] transition-colors">
                      {product.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-[#889063] font-medium leading-relaxed mb-5">
                    {product.description.length > 60 ? product.description.substring(0, 60) + '...' : product.description}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[#CFBB99]/50">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-[#889063]">Price</p>
                    <span className="text-2xl font-bold text-[#354024]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      ₹{Number(product.price).toFixed(2)}
                    </span>
                  </div>

                  {product.stock === 0 ? (
                    <span className="px-4 py-2 text-xs font-semibold tracking-widest uppercase text-[#889063]
                      border border-[#CFBB99] rounded-full cursor-not-allowed bg-[#F0EAE0]">
                      Sold Out
                    </span>
                  ) : cartItem ? (
                    <div className="flex items-center gap-1 bg-[#E5D7C4] rounded-full px-1.5 py-1.5
                      border border-[#CFBB99]/70 shadow-inner">
                      <button
                        onClick={() => decrementQuantity(product.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#4C3D19] font-bold
                          hover:bg-[#CFBB99] transition-colors duration-150 text-lg"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-[#354024]">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#4C3D19] font-bold
                          hover:bg-[#CFBB99] transition-colors duration-150 text-lg"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product)}
                      className="px-5 py-2.5 bg-[#354024] text-[#E5D7C4] text-xs font-bold tracking-widest uppercase
                        rounded-full hover:bg-[#4C3D19] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Add
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