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

  const cartTotal = getCartTotal();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return setError('Your cart is empty!');

    try {
      const payload = {
        shippingAddress: formData.shippingAddress,
        phone: formData.phone,
        totalAmount: cartTotal, 
        items: items 
      };

      await api.post('/checkout', payload);
      
      clearCart(); // Wipe the cart
      navigate('/my-orders'); // Teleport the user to their receipts!
      
    } catch (err: any) {
      console.error('Full Checkout Error:', err);
      const backendError = err.response?.data?.error;
      setError(backendError || err.message || 'Checkout failed.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
      
      {/* Left Column: The Cart Details */}
      <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <h2>Review Your Cart</h2>
        
        {items.length === 0 ? (
          <p>Your cart is currently empty.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {items.map((item) => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <div>
                  <strong>{item.name}</strong> <br/>
                  <small>Qty: {item.quantity} x ${Number(item.price).toFixed(2)}</small>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                  <button onClick={() => removeFromCart(item.productId)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
                </div>
              </div>
            ))}
            
            <div style={{ textAlign: 'right', fontSize: '20px', marginTop: '10px' }}>
              <strong>Total: ${cartTotal.toFixed(2)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: The Checkout Form */}
      <div style={{ width: '350px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <h2>Secure Checkout</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <textarea 
            placeholder="Shipping Address (Street, City, Zip)" 
            required rows={3}
            value={formData.shippingAddress} 
            onChange={(e) => setFormData({...formData, shippingAddress: e.target.value})}
            style={{ padding: '10px' }}
          />
          <input 
            type="tel" placeholder="Phone Number" required 
            value={formData.phone} 
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            style={{ padding: '10px' }}
          />
          <button 
            type="submit" 
            disabled={items.length === 0}
            style={{ padding: '12px', backgroundColor: items.length === 0 ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: items.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          >
            Complete Purchase
          </button>
        </form>
      </div>
    </div>
  );
}