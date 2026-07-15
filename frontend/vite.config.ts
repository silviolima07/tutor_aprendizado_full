// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Redireciona todas as requisições /api para o backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // Opcional: reescreve o path se necessário
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: '../backend/static',
    emptyOutDir: true
  }
});