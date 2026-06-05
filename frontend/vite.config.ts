import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/v1': {
        target: 'https://big-bazaar-981x.onrender.com:3001',
        changeOrigin: true,
      }
    }
  }
})