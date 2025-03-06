import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import process from 'process';

export default defineConfig({
  assetsInclude: ['**/*.wasm'],
  plugins: [react(), viteCommonjs()],
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
    // alias: {
    //   '@cornerstonejs/tools': '@cornerstonejs/tools/dist/umd/index.js',
    // },
  },
  // seems like only required in dev mode
  optimizeDeps: {
    exclude: ['@cornerstonejs/dicom-image-loader', '@cornerstonejs/polymorphic-segmentation'],
    include: ['dicom-parser'],
  },
  worker: {
    format: 'es',
  },
  base: process.env.NODE_ENV === 'production' ? '/cursor-dicom-viewer/' : '/',
});
