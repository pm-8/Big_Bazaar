import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Storefront from './pages/Storefront';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import ProductDetail from './pages/ProductDetail';
function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes (Must be logged in) */}
      <Route element={<ProtectedRoute />}>
        {/* Everything inside here gets the Layout (Header + Sidebar) */}
        <Route element={<Layout />}>
          
          {/* Admin Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          
          {/* Customer Routes */}
          <Route path="/store" element={<Storefront />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;