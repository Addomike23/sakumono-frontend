// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: '0.0.0.0',
//     port: 5173,
//   },
// });

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
    strictPort: true,
    cors: true,
    // ============================================================
    // PROXY CONFIGURATION - Forward /api requests to backend
    // ============================================================
    proxy: {
      '/api': {
        target: 'https://sakumono-backend.vercel.app',
        // target: 'http://localhost:8000',
        changeOrigin: true,
        // Optional: Rewrite path if needed
        // rewrite: (path) => path.replace(/^\/api/, ''),
        // For WebSocket connections
        ws: true,
        // Configure proxy logging
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('⚠️ Proxy Error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('➡️ Proxy Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('⬅️ Proxy Response:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  // Optional: Define environment variables
  define: {
    'import.meta.env.VITE_USE_PROXY': JSON.stringify(true),
  },
})
