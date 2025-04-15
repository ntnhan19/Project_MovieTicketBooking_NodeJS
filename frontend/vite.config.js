// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002, // Cấu hình frontend chạy ở port 3002
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Proxy API về backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
