import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:5001',
        ws: true
      },
      '/api': {
        target: 'http://localhost:5001'
      }
    }
  }
});