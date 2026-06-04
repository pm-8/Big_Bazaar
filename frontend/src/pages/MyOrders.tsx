import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/me');
        setOrders(res.data.data);
      } catch (err) {
        console.error('Failed to fetch orders');
      }
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <h1>My Order History</h1>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {orders.map((order) => (
            <div key={order.id} style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                <span style={{ padding: '4px 8px', backgroundColor: '#e2e3e5', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  {order.status}
                </span>
              </div>
              <p style={{ margin: '5px 0', color: '#666' }}>Placed on: {new Date(order.created_at).toLocaleDateString()}</p>
              <p style={{ margin: '5px 0' }}><strong>Total: ${Number(order.total_amount).toFixed(2)}</strong></p>
              <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>Shipping to: {order.shipping_address}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}