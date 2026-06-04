import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

export default function Layout() {
  const { user, clearAuth } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth(); // Wipes the global auth state
    navigate('/login'); // Sends you back to login
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Top Header Bar */}
      <header style={{ padding: '15px 30px', backgroundColor: '#1a1a1a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>My E-Commerce Store</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span>Logged in as: <strong>{user?.name}</strong></span>
          <button onClick={handleLogout} style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </header>

      {/* Content Area Wrapper */}
      <div style={{ display: 'flex', flex: 1 }}>
        
        {/* Left Hand Navigation Sidebar */}
        <nav style={{ width: '220px', backgroundColor: '#fff', borderRight: '1px solid #ddd', padding: '20px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* The Customer Links */}
            <li>
              <Link to="/store" style={{ display: 'block', padding: '10px', color: '#333', textDecoration: 'none', borderRadius: '4px', fontWeight: '500', backgroundColor: '#f8f9fa' }}>
                🛍️ Storefront
              </Link>
            </li>
            <li>
              <Link to="/checkout" style={{ display: 'block', padding: '10px', color: '#333', textDecoration: 'none', borderRadius: '4px', fontWeight: '500' }}>
                🛒 Cart ({items.length})
              </Link>
            </li>
            <li>
              <Link to="/my-orders" style={{ display: 'block', padding: '10px', color: '#333', textDecoration: 'none', borderRadius: '4px', fontWeight: '500' }}>
                📦 My Orders
              </Link>
            </li>

            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />

            {/* The Admin Links */}
            <li style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', paddingLeft: '10px' }}>Admin Tools</li>
            <li>
              <Link to="/" style={{ display: 'block', padding: '10px', color: '#333', textDecoration: 'none', borderRadius: '4px', fontWeight: '500' }}>
                📊 Dashboard
              </Link>
            </li>
            <li>
              <Link to="/products" style={{ display: 'block', padding: '10px', color: '#333', textDecoration: 'none', borderRadius: '4px', fontWeight: '500' }}>
                ⚙️ Manage Inventory
              </Link>
            </li>
          </ul>
        </nav>

        {/* Main Workspace (where the pages actually render) */}
        <main style={{ padding: '30px', flex: 1, backgroundColor: '#f4f4f9' }}>
          <Outlet />
        </main>

      </div>
    </div>
  );
}