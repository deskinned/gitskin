import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

const target = process.env.BUILD_TARGET ?? 'chrome';

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: resolve(__dirname, `../dist/${target}`),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'background/service-worker': resolve(__dirname, '../src/background/service-worker.ts'),
        'content/bootstrap': resolve(__dirname, '../src/content/bootstrap.ts'),
        'popup/main': resolve(__dirname, '../src/popup/main.ts'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, '../src/shared'),
      '@lib': resolve(__dirname, '../src/lib'),
    },
  },
});
