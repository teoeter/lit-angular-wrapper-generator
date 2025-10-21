import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { litComponentsPlugin } from './vite-plugins/lit-components-plugin';

export default defineConfig({
  plugins: [
    // Generate TypeScript declarations
    dts({
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
      rollupTypes: true,
      insertTypesEntry: true,
    }),
    // Custom plugin for Lit components metadata generation
    litComponentsPlugin(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['lit', 'lit/decorators.js', 'lit/directives/class-map.js'],
      output: {
        preserveModules: false,
      },
    },
    sourcemap: true,
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
