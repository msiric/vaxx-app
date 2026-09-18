import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom'], alias: { yup: path.resolve('node_modules/yup') } },
  server: {
    port: 5174,
    fs: { allow: ['..'] },
    proxy: { '/api': 'http://127.0.0.1:5074' },
  },
  build: { outDir: 'build', sourcemap: false },
});
