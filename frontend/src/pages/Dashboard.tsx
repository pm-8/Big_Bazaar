import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // NEW: State to track the order selected for the modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.data);
    } catch (err: any) {
      console.error('Failed to fetch admin orders', err);
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); 
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // NEW: Handler to open the modal and fetch deep details
  const handleViewOrder = async (order: any) => {
    try {
      // Attempt to fetch the full details (items, address, phone)
      const res = await api.get(`/admin/orders/${order.id}`);
      setSelectedOrder(res.data.data);
    } catch (err) {
      console.warn('Could not fetch deep details. Falling back to summary data.');
      // If the backend route isn't built yet, fallback to what we already know
      setSelectedOrder(order);
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

  if (loading) return <p style={{ padding: '20px' }}>Loading control center...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ marginTop: 0 }}>Admin Control Center</h1>
        <button onClick={fetchOrders} style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Refresh Data
        </button>
      </div>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* --- LIVE STATS CARDS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', borderLeft: '5px solid #007bff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Total Revenue</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>₹{totalRevenue.toFixed(2)}</p>
        </div>

        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', borderLeft: '5px solid #ffc107', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Action Required</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{pendingOrders} Pending</p>
        </div>

        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', borderLeft: '5px solid #28a745', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Total Orders</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{orders.length}</p>
        </div>
      </div>

      {/* --- RECENT ORDERS TABLE --- */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <h2 style={{ padding: '20px', margin: 0, borderBottom: '1px solid #eee' }}>Order Management</h2>
        
        {orders.length === 0 ? (
          <p style={{ padding: '20px' }}>No orders have been placed yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px 20px' }}>Order ID</th>
                <th style={{ padding: '12px 20px' }}>Customer</th>
                <th style={{ padding: '12px 20px' }}>Date</th>
                <th style={{ padding: '12px 20px' }}>Total</th>
                <th style={{ padding: '12px 20px' }}>Status</th>
                <th style={{ padding: '12px 20px' }}>Actions</th> {/* Added Actions Column */}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>#{order.id}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <strong>{order.customer_name}</strong><br/>
                    <small style={{ color: '#666' }}>{order.customer_email}</small>
                  </td>
                  <td style={{ padding: '15px 20px' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>₹{Number(order.total_amount).toFixed(2)}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{ 
                        padding: '6px 10px', 
                        borderRadius: '4px', 
                        fontWeight: 'bold',
                        border: '1px solid #ccc',
                        backgroundColor: order.status === 'PENDING' ? '#fff3cd' : order.status === 'COMPLETED' ? '#d4edda' : '#e2e3e5',
                        color: order.status === 'PENDING' ? '#856404' : order.status === 'COMPLETED' ? '#155724' : '#383d41'
                      }}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                  {/* NEW: View Details Button */}
                  <td style={{ padding: '15px 20px' }}>
                    <button 
                      onClick={() => handleViewOrder(order)}
                      style={{ padding: '6px 12px', backgroundColor: '#e9ecef', color: '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- THE MODAL OVERLAY --- */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          
          {/* Modal Content Box */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa', borderRadius: '12px 12px 0 0' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>Order #{selectedOrder.id} Details</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>&times;</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '25px' }}>
              
              {/* Customer Info Section */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Customer</p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>{selectedOrder.customer_name}</p>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{selectedOrder.customer_email}</p>
                  <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>📞 {selectedOrder.phone || 'No phone provided'}</p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Shipping Address</p>
                  <p style={{ margin: 0, color: '#444', fontSize: '14px', lineHeight: '1.5' }}>
                    {selectedOrder.address || 'No shipping address provided.'}
                  </p>
                </div>
              </div>

              {/* Items Section */}
              <h3 style={{ fontSize: '16px', margin: '0 0 15px 0', color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Items Ordered</h3>
              
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div style={{ marginBottom: '20px' }}>
                  {selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#444' }}>{item.product_name}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Qty: {item.quantity}</p>
                      </div>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#888', fontStyle: 'italic', marginBottom: '20px' }}>
                  Itemized details are not available for this order. (Backend API needs to return an 'items' array).
                </p>
              )}

              {/* Grand Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '15px 20px', borderRadius: '8px', border: '1px solid #eee' }}>
                <p style={{ margin: 0, fontWeight: 'bold', textTransform: 'uppercase', color: '#666', fontSize: '14px' }}>Grand Total</p>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '24px', color: '#28a745' }}>
                  ₹{Number(selectedOrder.total_amount).toFixed(2)}
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}