import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);

  // If they don't have a token, bounce them to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If they do, let them see the nested routes
  return <Outlet />;
}