import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useCartStore } from '../store/useCartStore';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string;
}

export default function ProductDetail() {
  const { id } = useParams(); // Grabs the ID from the URL
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const { items, addToCart, decrementQuantity } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        console.error('Failed to fetch product');
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <div className="p-8 text-[#889063]">Loading product details...</div>;

  const cartItem = items.find((item) => item.productId === product.id);

  return (
    <div className="max-w-5xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <button onClick={() => navigate('/store')} className="text-[#889063] text-sm font-bold tracking-widest uppercase hover:text-[#354024] mb-8 flex items-center gap-2 transition-colors">
        ← Back to Collection
      </button>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-[#CFBB99]/60 shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Massive Image Section */}
        <div className="w-full md:w-1/2 h-96 md:h-[600px] bg-[#E5D7C4]/30 relative">
          <img 
            src={product.image_url || 'https://placehold.co/800x800/E5D7C4/889063?text=Verdure'} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#889063] mb-3">Natural Reserve</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#354024] mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            {product.name}
          </h1>
          
          <span className="text-3xl font-bold text-[#4C3D19] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            ₹{Number(product.price).toFixed(2)}
          </span>

          <div className="h-px w-full bg-gradient-to-r from-[#CFBB99] to-transparent mb-8" />

          <p className="text-[#889063] leading-relaxed mb-10 text-lg">
            {product.description}
          </p>

          <div className="mt-auto">
            {product.stock === 0 ? (
              <div className="w-full py-4 text-center text-sm font-bold tracking-widest uppercase text-[#889063] border-2 border-[#CFBB99] rounded-xl bg-[#F0EAE0]">
                Currently Out of Stock
              </div>
            ) : cartItem ? (
              <div className="flex items-center justify-between bg-[#E5D7C4] rounded-xl p-2 border border-[#CFBB99]/70 shadow-inner">
                <button onClick={() => decrementQuantity(product.id)} className="w-14 h-12 rounded-lg flex items-center justify-center text-[#4C3D19] bg-white/50 hover:bg-white font-bold text-xl transition-all">
                  −
                </button>
                <span className="text-xl font-bold text-[#354024]">
                  {cartItem.quantity} in cart
                </span>
                <button onClick={() => addToCart(product)} className="w-14 h-12 rounded-lg flex items-center justify-center text-[#4C3D19] bg-white/50 hover:bg-white font-bold text-xl transition-all">
                  +
                </button>
              </div>
            ) : (
              <button onClick={() => addToCart(product)} className="w-full py-4 bg-[#354024] text-[#E5D7C4] text-sm font-bold tracking-[0.15em] uppercase rounded-xl hover:bg-[#4C3D19] active:scale-[0.98] transition-all shadow-lg">
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}