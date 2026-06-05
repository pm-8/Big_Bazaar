import { useState } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { items, getCartTotal, removeFromCart, clearCart } = useCartStore();
  const [formData, setFormData] = useState({ shippingAddress: '', phone: user?.phone || '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const cartTotal = getCartTotal();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return setError('Your cart is empty!');
    setLoading(true);
    try {
      await api.post('/checkout', {
        shippingAddress: formData.shippingAddress,
        phone: formData.phone,
        totalAmount: cartTotal,
        items,
      });
      clearCart();
      navigate('/my-orders');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 bg-white/80 border border-[#CFBB99] rounded-xl text-[#4C3D19]
    placeholder:text-[#889063]/80 text-sm font-medium focus:outline-none focus:border-[#354024]
    focus:ring-2 focus:ring-[#354024]/20 transition-all duration-200 shadow-sm resize-none`;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mb-8">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#889063] mb-1">Review & Pay</p>
        <h1 className="text-4xl font-bold text-[#354024]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Checkout
        </h1>
        <div className="mt-3 w-14 h-1 bg-gradient-to-r from-[#354024] to-[#889063] rounded-full" />
      </div>

      <div className="flex gap-7 items-start max-w-5xl">

        {/* Left — Cart Review */}
        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#CFBB99]/60 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#354024] via-[#889063] to-[#CFBB99]" />
          <div className="p-7">
            <h2 className="text-xl font-bold text-[#4C3D19] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              Your Cart
            </h2>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#889063]">
                <span className="text-4xl">🛒</span>
                <p className="text-sm font-semibold tracking-wide">Your cart is empty</p>
              </div>
            ) : (
              <div className="flex flex-col gap-0">
                {items.map((item, i) => (
                  <div
                    key={item.productId}
                    className={`flex justify-between items-center py-4 ${i < items.length - 1 ? 'border-b border-[#CFBB99]/50' : ''}`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#4C3D19]">{item.name}</p>
                      <p className="text-xs font-medium text-[#889063] mt-0.5">
                        {item.quantity} × ${Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-base font-bold text-[#354024]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-[#889063] hover:text-red-500 transition-all duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                <div className="mt-5 pt-5 border-t-2 border-[#CFBB99]/70 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#889063]">Order Total</p>
                    <p className="text-3xl font-bold text-[#354024] mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>
                      ${cartTotal.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-[#889063]">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                    <p className="text-xs font-medium text-[#889063]">Free shipping</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — Checkout Form */}
        <div className="w-[340px] shrink-0 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#CFBB99]/60 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#354024] via-[#889063] to-[#CFBB99]" />
          <div className="p-7">
            <h2 className="text-xl font-bold text-[#4C3D19] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Delivery Details
            </h2>
            <p className="text-xs font-medium text-[#889063] mb-6 tracking-wide">We'll ship to the address below</p>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCheckout} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#889063] block mb-1.5">
                  Shipping Address
                </label>
                <textarea
                  placeholder="Street, City, Zip Code"
                  required
                  rows={3}
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#889063] block mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="mt-2 pt-5 border-t border-[#CFBB99]/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-[#889063]">Total due</span>
                  <span className="text-xl font-bold text-[#354024]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={items.length === 0 || loading}
                  className="w-full py-4 bg-[#354024] text-[#E5D7C4] text-sm font-bold tracking-[0.12em] uppercase
                    rounded-xl hover:bg-[#4C3D19] active:scale-[0.98] transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Processing…' : '✦ Complete Purchase'}
                </button>
                <p className="text-center text-xs text-[#889063] font-medium mt-3">
                  🔒 Secured & encrypted checkout
                </p>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}