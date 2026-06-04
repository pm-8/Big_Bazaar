import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // clear old errors

    try {
      // Decide which backend route to hit based on the toggle state
      const endpoint = isLogin ? '/users/login' : '/users/register';
      
      // If logging in, only send email and password. Otherwise, send everything.
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await api.post(endpoint, payload);
      
      // Extract the successful data
      const { user, token } = res.data.data;
      
      // Save session globally
      setAuth(user, token);
      
      // Route to the storefront!
      navigate('/'); 
    } catch (err: any) {
      console.error('Auth Error:', err);
      // Display the exact error message your backend sent (e.g., "Invalid email")
      setError(err.response?.data?.error || 'Authentication failed. Is the backend running?');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>
        {isLogin ? 'Welcome Back' : 'Create an Account'}
      </h2>
      
      {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Only show Name and Phone if they are registering */}
        {!isLogin && (
          <>
            <input 
              type="text" name="name" placeholder="Full Name" required 
              value={formData.name} onChange={handleChange} 
              style={{ padding: '10px' }}
            />
            <input 
              type="tel" name="phone" placeholder="Phone Number" required 
              value={formData.phone} onChange={handleChange} 
              style={{ padding: '10px' }}
            />
          </>
        )}

        <input 
          type="email" name="email" placeholder="Email Address" required 
          value={formData.email} onChange={handleChange} 
          style={{ padding: '10px' }}
        />
        
        <input 
          type="password" name="password" placeholder="Password" required 
          value={formData.password} onChange={handleChange} 
          style={{ padding: '10px' }}
        />

        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isLogin ? 'Sign In' : 'Register'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', cursor: 'pointer', color: '#007bff' }} onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
      </p>
    </div>
  );
}