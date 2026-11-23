import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// SWC est nécessaire pour les métadonnées de décorateurs utilisées par l'injection de dépendances NestJS.
export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: { include: ['test/**/*.test.ts'], environment: 'node' },
});
