// @ts-check
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import sentry from '@sentry/astro';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { GALLERY } from './src/lib/gallery.ts';

const site = 'https://hiring-github-profile.vercel.app';
// Gallery profiles are server-rendered on demand, so list them explicitly
const galleryPages = GALLERY.flatMap((group) =>
  group.profiles.map((profile) => `${site}/${profile.login}`),
);

const enableSentry = process.env.ENABLE_SENTRY === 'true';

// https://astro.build/config
export default defineConfig({
  site,
  base: '/',
  output: 'server',
  adapter: vercel(),

  integrations: [
    react(),
    sitemap({ customPages: galleryPages }),
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
