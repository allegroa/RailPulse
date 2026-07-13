import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/webone/',
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '^/api/config(/|$)': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/taipei_static': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    },
    fs: {
      strict: false
    }
  },
  css: {
    devSourcemap: true,
  }
})