import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

export default function Layout() {
  const { user, clearAuth } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const navLink = (to: string, label: string, icon: string) => {
    const isActive = location.pathname === to;
    return (
      <li>
        <Link
          to={to}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-semibold tracking-wide transition-all duration-200
            ${isActive
              ? 'bg-[#354024] text-[#E5D7C4] shadow-sm'
              : 'text-[#4C3D19] hover:bg-[#CFBB99]/50 hover:text-[#354024]'
            }`}
        >
          <span className="text-base">{icon}</span>
          {label}
        </Link>
      </li>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0EAE0]" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* Header */}
      <header className="px-8 py-4 bg-[#4C3D19] flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#889063] flex items-center justify-center shadow">
            <span className="text-[#E5D7C4] text-sm font-bold">BB</span>
          </div>
          <h1 className="text-[#E5D7C4] text-xl tracking-[0.18em] uppercase font-semibold">
            Big Bazaar
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-[#CFBB99] text-sm font-medium">
            Hello, <span className="text-[#E5D7C4] font-semibold">{user?.name}</span>
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-[#889063]/70 text-[#CFBB99] text-xs font-semibold tracking-widest uppercase hover:bg-[#889063]/20 transition-all duration-200 rounded-lg"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">

        {/* Sidebar */}
        <nav className="w-60 bg-[#E5D7C4] border-r border-[#CFBB99]/70 py-8 px-4 flex flex-col gap-1 shrink-0 shadow-sm">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#889063] px-4 mb-3">Shop</p>
          <ul className="flex flex-col gap-1">
            {navLink('/', 'Storefront', '🛍️')}
            {navLink('/checkout', `Cart (${items.length})`, '🛒')}
            {navLink('/my-orders', 'My Orders', '📦')}
          </ul>

          {/* SECURITY UPDATE: Only show Admin section if the user's role is ADMIN */}
          {user?.role === 'ADMIN' && (
            <>
              <div className="my-5 border-t border-[#CFBB99]/70" />

              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#889063] px-4 mb-3">Admin</p>
              <ul className="flex flex-col gap-1">
                {navLink('/dashboard', 'Dashboard', '📊')}
                {navLink('/products', 'Inventory', '⚙️')}
              </ul>
            </>
          )}
        </nav>

        {/* Main */}
        <main className="flex-1 p-8 bg-[#F0EAE0]/80 min-h-full">
          <Outlet />
        </main>

      </div>
    </div>
  );
}