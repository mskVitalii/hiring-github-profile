// @ts-check
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import sentry from '@sentry/astro';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import fs from 'node:fs/promises';
import { GALLERY } from './src/lib/gallery.ts';

const site = 'https://hiring-github-profile.vercel.app';
// Gallery profiles are server-rendered on demand, so list them explicitly
const galleryPages = GALLERY.flatMap((group) =>
  group.profiles.map((profile) => `${site}/${profile.login}`),
);

const enableSentry = process.env.ENABLE_SENTRY === 'true';

/** Drop public .map files after every Sentry upload pass has finished */
function removeClientSourcemaps() {
  return {
    name: 'remove-client-sourcemaps',
    hooks: {
      'astro:build:done': async () => {
        for (const dir of ['dist/client', '.vercel/output/static']) {
          for await (const file of fs.glob(`${dir}/**/*.map`)) {
            await fs.rm(file);
          }
        }
      },
    },
  };
}

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
            // Sentry org slug predates the project rename; the auth token is
            // scoped to it, so a different value is ignored with a warning
            org: 'hiring-github-readme',
            authToken: process.env.SENTRY_AUTH_TOKEN,
            telemetry: false,
            sourcemaps: {
              // Default with the Vercel adapter is {.vercel,dist}/**/*: the
              // second upload pass re-reads server chunks the adapter copied
              // into .vercel/output without maps, plus traced node_modules,
              // producing "no sourcemap found" warnings.
              assets: ['./dist/**/*'],
              // Deleting after each pass makes the next pass see mapless
              // chunks; public client maps are removed once in build:done
              filesToDeleteAfterUpload: [],
            },
          }),
          removeClientSourcemaps(),
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
