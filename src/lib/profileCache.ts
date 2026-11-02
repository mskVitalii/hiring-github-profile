import { isGalleryLogin } from './gallery';
import { scanUser } from './github';
import type { ScanResult } from './types';

/**
 * Gallery profiles are served pre-scanned: repos of famous developers change
 * slowly, so the CDN keeps a scan fresh for a day and may serve it stale for a
 * week while it revalidates in the background.
 */
export const PROFILE_CACHE_CONTROL =
  'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800';

/** Top repos kept in a cached scan — enough for a README, small enough to inline */
const MAX_CACHED_REPOS = 100;
const MEMORY_TTL = 24 * 60 * 60 * 1000;

// Per-instance cache: covers dev and warm serverless instances between CDN misses
const memory = new Map<string, { at: number; result: Promise<ScanResult> }>();

export function getProfileScan(login: string): Promise<ScanResult> {
  const key = login.toLowerCase();
  const hit = memory.get(key);
  if (hit && Date.now() - hit.at < MEMORY_TTL) return hit.result;

  // A server token unlocks the deep scan; without it we fall back to basic mode
  const token = import.meta.env.GITHUB_TOKEN || undefined;
  const result = scanUser(login, token, undefined, {
    maxRepos: MAX_CACHED_REPOS,
  });
  memory.set(key, { at: Date.now(), result });
  result.catch(() => memory.delete(key));
  return result;
}

export { isGalleryLogin };
