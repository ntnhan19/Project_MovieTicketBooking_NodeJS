// admin/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    open: true,
    proxy: {
      // Thêm proxy để giải quyết vấn đề CORS và chuyển tiếp yêu cầu API
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
});
