import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('gsap')) return 'gsap';
          if (id.includes('react')) return 'react';
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    open: false,
  },
});
