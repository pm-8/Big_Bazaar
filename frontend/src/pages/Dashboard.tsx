import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  // Handler to change order status
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      // Refresh the table to show the new status
      fetchOrders(); 
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Calculate live stats for the cards
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
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>${totalRevenue.toFixed(2)}</p>
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
                  <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>${Number(order.total_amount).toFixed(2)}</td>
                  <td style={{ padding: '15px 20px' }}>
                    
                    {/* Interactive Status Dropdown */}
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}