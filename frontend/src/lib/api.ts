import axios from 'axios';

// 1. Create the base instance
export const api = axios.create({
  baseURL: 'https://big-bazaar-981x.onrender.com:3001/api/v1', // Make sure this matches your backend port!
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Add the Interceptor (The Magic Step)
api.interceptors.request.use(
  (config) => {
    // Dig into local storage to find the Zustand save file
    const authStorage = localStorage.getItem('ecommerce-auth');
    
    if (authStorage) {
      try {
        // Parse the JSON string back into a JavaScript object
        const authData = JSON.parse(authStorage);
        const token = authData?.state?.token;
        
        // If a token exists, attach it to the Authorization header
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to parse auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);