// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite'

// Эмулируем __dirname для ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss(),],

  resolve: {
    alias: {
      // основной алиас — @ → src/
      '@': path.resolve(__dirname, './src'),

      // можно добавить более точные (рекомендую, меньше конфликтов)
      // '@components': path.resolve(__dirname, './src/components'),
      // '@pages':       path.resolve(__dirname, './src/pages'),
      // '@hooks':       path.resolve(__dirname, './src/hooks'),
      // '@services':    path.resolve(__dirname, './src/services'),
      // '@utils':       path.resolve(__dirname, './src/utils'),
    },
  },

  // опционально — ускоряет HMR и открывает браузер
  server: {
    open: true,
  },
});