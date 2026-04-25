/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Repo is published at https://zayez.github.io/emaned/ — Vite needs this
  // base path so built asset URLs resolve correctly. Local dev uses '/'.
  base: process.env.NODE_ENV === 'production' ? '/emaned/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
