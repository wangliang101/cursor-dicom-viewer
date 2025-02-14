import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'process';

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    alias: {
      '@cornerstonejs/tools': '@cornerstonejs/tools/dist/umd/index.js',
    },
  },
  base: process.env.NODE_ENV === 'production' ? '/cursor-dicom-viewer/' : '/',
});
