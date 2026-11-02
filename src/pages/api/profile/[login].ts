import type { APIRoute } from 'astro';
import {
  getProfileScan,
  isGalleryLogin,
  PROFILE_CACHE_CONTROL,
} from '../../../lib/profileCache';

export const prerender = false;

/** Pre-scanned gallery profile, cached on the CDN (see PROFILE_CACHE_CONTROL) */
export const GET: APIRoute = async ({ params }) => {
  const login = params.login?.trim() ?? '';

  // Only curated profiles: an open endpoint would spend the server token on anyone
  if (!isGalleryLogin(login)) {
    return new Response(JSON.stringify({ error: 'Not a gallery profile.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await getProfileScan(login);
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': PROFILE_CACHE_CONTROL,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'GitHub scan failed unexpectedly';
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
};
