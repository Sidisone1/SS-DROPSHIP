import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@ss-dropship/i18n', '@ss-dropship/ui', '@ss-dropship/types'],
  poweredByHeader: false,
  reactStrictMode: true,
  // Le back-office ne doit jamais être indexé.
  async headers() {
    return [{ source: '/:chemin*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
};

export default config;
