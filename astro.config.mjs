// @ts-check
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import sentry from '@sentry/astro';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const enableSentry = process.env.ENABLE_SENTRY === 'true';

// https://astro.build/config
export default defineConfig({
  site: 'https://hiring-github-profile.vercel.app',
  base: '/',
  output: 'server',
  adapter: vercel(),

  integrations: [
    react(),
    sitemap(),
    ...(enableSentry
      ? [
          sentry({
            project: 'javascript-astro',
            org: 'hiring-github-profile',
            authToken: process.env.SENTRY_AUTH_TOKEN,
          }),
        ]
      : []),
  ],

  vite: {
    plugins: [tailwindcss()],
    build: {
      target: 'es2022',
    },
  },
});
