import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import Sitemap from 'vite-plugin-sitemap';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      Sitemap({
        hostname: 'https://aegis.net.tr',
        dynamicRoutes: [
          '/',
          '/ai',
          '/tools',
          '/tools/ip-intelligence',
          '/tools/domain-analyzer',
          '/tools/hash-generator',
          '/tools/base64-codec',
          '/tools/ctf-workspace',
          '/blog',
          '/privacy-policy',
          '/terms-of-service',
        ],
        exclude: ['/404'],
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
