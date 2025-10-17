import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@phosphor-icons/react'],
  },
  define: {
    __WS_TOKEN__: JSON.stringify(''),
  },
  server: {
    proxy: {
      // Proxy API requests to the landing receiver endpoint
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
      },
    },
  },
  // Serve landing pages as static assets
  publicDir: 'public',
});
