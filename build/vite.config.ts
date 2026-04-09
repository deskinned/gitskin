import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';

const target = process.env.BUILD_TARGET ?? 'chrome';
const outDir = resolve(__dirname, `../dist/${target}`);

function postBuild() {
  return {
    name: 'post-build',
    closeBundle() {
      // Copy manifest
      const manifest = JSON.parse(
        readFileSync(resolve(__dirname, '../src/manifest.v3.json'), 'utf8'),
      );
      mkdirSync(outDir, { recursive: true });
      writeFileSync(resolve(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

      // Copy icons
      const iconsDir = resolve(__dirname, '../src/icons');
      if (existsSync(iconsDir)) {
        cpSync(iconsDir, resolve(outDir, 'icons'), { recursive: true });
      }

      // Move popup HTML from src/popup/ to popup/ and fix paths
      const srcPopup = resolve(outDir, 'src/popup/index.html');
      const destPopup = resolve(outDir, 'popup/index.html');
      if (existsSync(srcPopup)) {
        let html = readFileSync(srcPopup, 'utf8');
        html = html.replace(/src="[^"]*index\.js"/, 'src="./index.js"');
        mkdirSync(resolve(outDir, 'popup'), { recursive: true });
        writeFileSync(destPopup, html);
        rmSync(resolve(outDir, 'src'), { recursive: true, force: true });
      }
    },
  };
}

const sharedResolve = {
  alias: {
    '@shared': resolve(__dirname, '../src/shared'),
    '@lib': resolve(__dirname, '../src/lib'),
  },
};

// Build entry determines the config shape.
// Content script needs IIFE (no imports allowed in MV3 content scripts).
// Service worker and popup use ESM.
const entry = process.env.BUILD_ENTRY;

function contentScriptConfig() {
  return defineConfig({
    plugins: [],
    build: {
      outDir,
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, '../src/content/bootstrap.ts'),
        formats: ['iife'],
        name: 'gitskinBootstrap',
        fileName: () => 'content/bootstrap.js',
      },
    },
    resolve: sharedResolve,
  });
}

function mainConfig() {
  return defineConfig({
    plugins: [svelte(), postBuild()],
    base: '',
    build: {
      outDir,
      emptyOutDir: true,
      rollupOptions: {
        input: {
          'background/service-worker': resolve(__dirname, '../src/background/service-worker.ts'),
          'popup/index': resolve(__dirname, '../src/popup/index.html'),
        },
        output: {
          format: 'es',
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
        },
      },
    },
    resolve: sharedResolve,
  });
}

export default entry === 'content' ? contentScriptConfig() : mainConfig();
