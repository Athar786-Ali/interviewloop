import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // In Vite dev mode, proxy all API calls to the local FastAPI backend
      '/auth':      { target: 'http://localhost:8000', changeOrigin: true },
      '/interview': { target: 'http://localhost:8000', changeOrigin: true },
      '/security':  { target: 'http://localhost:8000', changeOrigin: true },
      '/report':    { target: 'http://localhost:8000', changeOrigin: true },
      '/user':      { target: 'http://localhost:8000', changeOrigin: true },
      '/health':    { target: 'http://localhost:8000', changeOrigin: true },
      '/verify':    { target: 'http://localhost:8000', changeOrigin: true },
      '/ws':        {
        target: 'ws://localhost:8000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
        },
      },
    },
  },
})
