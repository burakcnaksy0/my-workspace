import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.IS_PREACT': JSON.stringify('false'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'roughjs/bin/rough': path.resolve(__dirname, './node_modules/roughjs/bin/rough.js'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/actuator': {
        target: process.env.BACKEND_URL || 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Büyük bağımsız paketleri ayrı chunk'lara böl: çizim/düzenleyici
        // eklentileri yalnızca ilgili ekranlarda indirilir, önbellek isabeti artar
        manualChunks: {
          excalidraw: ['@excalidraw/excalidraw'],
          tiptap: ['@tiptap/react', '@tiptap/starter-kit'],
        },
      },
    },
  },
  // @ts-expect-error vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
