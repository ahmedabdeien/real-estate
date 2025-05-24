// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: isProduction
          ? 'https://elsarh.onrender.com' // 🔁 استخدم رابط Render هنا
          : 'http://localhost:3000', // التطوير المحلي
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
