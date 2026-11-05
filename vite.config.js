import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split long-lived vendor libraries into their own cacheable chunks
        // so the app entry stays small. Everything else keeps its natural
        // (lazy) placement with the route that imports it.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          const path = id.split('node_modules/')[1] || '';
          const pkg = path.startsWith('@')
            ? path.split('/').slice(0, 2).join('/')
            : path.split('/')[0];

          if (['react', 'react-dom', 'scheduler'].includes(pkg)) {
            return 'react-vendor';
          }
          if (pkg.startsWith('react-router')) return 'router-vendor';
          if (pkg === 'react-icons') return 'icons-vendor';
          return undefined;
        },
      },
    },
  },
});
