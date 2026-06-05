import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/users/login' : '/users/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;
      const res = await api.post(endpoint, payload);
      const { user, token } = res.data.data;
      
      setAuth(user, token);
      
      // SECURITY UPDATE: Route the user based on their specific role!
      if (user.role === 'ADMIN') {
        navigate('/'); // Send admins to the dashboard
      } else {
        navigate('/store'); // Send customers straight to the shop
      }

    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 bg-white/80 border border-[#CFBB99] rounded-xl text-[#4C3D19]
    placeholder:text-[#889063]/80 text-sm font-medium tracking-wide focus:outline-none focus:border-[#354024]
    focus:ring-2 focus:ring-[#354024]/20 transition-all duration-200 shadow-sm`;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: 'radial-gradient(ellipse at 20% 20%, #889063 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #CFBB99 0%, transparent 50%), #E5D7C4',
      }}
    >
      <div className="w-full max-w-md" style={{ animation: 'fadeUp 0.5s ease both' }}>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#354024] mb-4 shadow-xl">
            <span className="text-[#E5D7C4] text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>BB</span>
          </div>
          <h1 className="text-3xl tracking-[0.2em] uppercase text-[#354024] font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Big Bazaar
          </h1>
          <p className="text-[#889063] text-xs tracking-widest mt-1 uppercase font-medium">Natural Living Store</p>
        </div>

        <div className="bg-white/65 backdrop-blur-lg rounded-2xl shadow-2xl border border-[#CFBB99]/60 p-8">
          <h2 className="text-2xl font-bold text-[#4C3D19] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-[#889063] font-medium mb-6">
            {isLogin ? 'Sign in to continue your journey' : 'Join us for a refined experience'}
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <>
                <input type="text" name="name" placeholder="Full Name" required
                  value={formData.name} onChange={handleChange} className={inputClass} />
                <input type="tel" name="phone" placeholder="Phone Number" required
                  value={formData.phone} onChange={handleChange} className={inputClass} />
              </>
            )}
            <input type="email" name="email" placeholder="Email Address" required
              value={formData.email} onChange={handleChange} className={inputClass} />
            <input type="password" name="password" placeholder="Password" required
              value={formData.password} onChange={handleChange} className={inputClass} />

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 bg-[#354024] text-[#E5D7C4] text-sm font-semibold tracking-[0.12em] uppercase
                rounded-xl hover:bg-[#4C3D19] active:scale-[0.98] transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p
            className="mt-6 text-center text-sm text-[#889063] cursor-pointer hover:text-[#354024] transition-colors duration-200 font-medium"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span className="underline underline-offset-4 font-semibold text-[#354024]">
              {isLogin ? 'Sign up' : 'Sign in'}
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}