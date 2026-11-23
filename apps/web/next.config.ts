import type { NextConfig } from 'next';

const config: NextConfig = {
  // Les paquets du monorepo sont livrés en TypeScript source.
  transpilePackages: ['@ss-dropship/config', '@ss-dropship/i18n', '@ss-dropship/ui', '@ss-dropship/types'],
  poweredByHeader: false,
  reactStrictMode: true,
};

export default config;
