import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const bypassHtml = (req) => req.headers.accept?.includes('text/html') ? req.url : null;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // In Vite dev mode, proxy all API calls to the local FastAPI backend
      // `bypassHtml` ensures a page refresh on `/interview` serves the React SPA instead of hitting the backend
      '/auth':      { target: 'http://localhost:8000', changeOrigin: true, bypass: bypassHtml },
      '/interview': { target: 'http://localhost:8000', changeOrigin: true, bypass: bypassHtml },
      '/security':  { target: 'http://localhost:8000', changeOrigin: true, bypass: bypassHtml },
      '/report':    { target: 'http://localhost:8000', changeOrigin: true, bypass: bypassHtml },
      '/user':      { target: 'http://localhost:8000', changeOrigin: true, bypass: bypassHtml },
      '/health':    { target: 'http://localhost:8000', changeOrigin: true, bypass: bypassHtml },
      '/verify':    { target: 'http://localhost:8000', changeOrigin: true, bypass: bypassHtml },
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
