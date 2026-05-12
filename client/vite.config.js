// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  envDir: '../',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Fix CJS packages (react-quill, leaflet) for Vite production build
  optimizeDeps: {
    include: ['react-quill', 'leaflet', 'react-leaflet'],
  },
  build: {
    commonjsOptions: {
      include: [/react-quill/, /leaflet/, /node_modules/],
    },
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress known harmless warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
    },
  },
  server: {
    port: 5173,
    hmr: { port: 5173 },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
