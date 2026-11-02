import { aggregateSkills, buildRepoInfo, rankRepos } from './detect';
import type { RepoSignals } from './detect';
import {
  parseManifest,
  ROOT_MANIFESTS_BY_LANGUAGE,
  selectManifestPaths,
  type ParsedManifest,
} from './manifests';
import type {
  GitHubRepo,
  GitHubUser,
  RepoLanguages,
  ScanResult,
} from './types';

const API_BASE = 'https://api.github.com';
/** Public file contents; not counted against the REST API rate limit */
const RAW_BASE = 'https://raw.githubusercontent.com';

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const CACHE_PREFIX = 'gh2_';

/** Deep mode (token): repos that get a language breakdown */
const DEEP_LANGUAGE_LIMIT = 80;
/** Deep mode (token): repos that get a file tree + manifests */
const DEEP_TREE_LIMIT = 40;
/** Basic mode (no token): repos whose root manifest is probed via raw */
const BASIC_MANIFEST_LIMIT = 25;

const API_CONCURRENCY = 8;
const RAW_CONCURRENCY = 10;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function getCached<T>(key: string): T | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = getCached<T>(key);
  if (hit !== null) return hit;
  const data = await load();
  setCache(key, data);
  return data;
}

/** Map items with at most `limit` promises in flight */
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

export class RateLimitError extends Error {}

async function ghFetch<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { headers });

  if (
    (res.status === 403 || res.status === 429) &&
    res.headers.get('x-ratelimit-remaining') === '0'
  ) {
    const resetTime = Number(res.headers.get('x-ratelimit-reset')) * 1000;
    const waitMin = Math.max(1, Math.ceil((resetTime - Date.now()) / 60000));
    throw new RateLimitError(
      `GitHub API rate limit exceeded. Resets in ~${waitMin} minutes.`,
    );
  }
  if (res.status === 404) {
    throw new Error('User not found. Check the username and try again.');
  }
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function rawFetch(
  owner: string,
  repo: string,
  path: string,
): Promise<string | null> {
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  try {
    const res = await fetch(
      `${RAW_BASE}/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/HEAD/${encoded}`,
    );
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

export function fetchUser(
  username: string,
  token?: string,
): Promise<GitHubUser> {
  return cached(`user_${username}`, () =>
    ghFetch<GitHubUser>(`/users/${encodeURIComponent(username)}`, token),
  );
}

/** Non-fork repos (optionally without archived). Without a token: first 100. */
export async function fetchRepos(
  username: string,
  includeArchived = true,
  token?: string,
): Promise<GitHubRepo[]> {
  const all = await cached(
    `repos_${username}_${token ? 'all' : 'first'}`,
    async () => {
      const repos: GitHubRepo[] = [];
      const perPage = 100;
      const maxPages = token ? 20 : 1;
      for (let page = 1; page <= maxPages; page++) {
        const batch = await ghFetch<GitHubRepo[]>(
          `/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&page=${page}&sort=pushed&type=owner`,
          token,
        );
        repos.push(...batch);
        if (batch.length < perPage) break;
      }
      return repos.filter((r) => !r.fork);
    },
  );
  return all.filter((r) => includeArchived || !r.archived);
}

function fetchRepoLanguages(
  owner: string,
  repo: string,
  token?: string,
): Promise<RepoLanguages> {
  return cached(`langs_${owner}_${repo}`, () =>
    ghFetch<RepoLanguages>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`,
      token,
    ),
  );
}

function fetchRepoTreePaths(
  owner: string,
  repo: string,
  token?: string,
): Promise<string[]> {
  return cached(`tree_${owner}_${repo}`, async () => {
    const tree = await ghFetch<{ tree?: Array<{ path?: string }> }>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/HEAD?recursive=1`,
      token,
    ).catch((err) => {
      if (err instanceof RateLimitError) throw err;
      return { tree: [] }; // empty repo
    });
    return (tree.tree ?? [])
      .map((e) => e.path ?? '')
      .filter((p) => p && !p.includes('node_modules/'));
  });
}

function fetchManifest(
  owner: string,
  repo: string,
  path: string,
): Promise<ParsedManifest | null> {
  return cached(`manifest_${owner}_${repo}_${path}`, async () => {
    const content = await rawFetch(owner, repo, path);
    return content ? parseManifest(path, content) : null;
  });
}

function fetchCompose(
  owner: string,
  repo: string,
  path: string,
): Promise<string | null> {
  return cached(`compose_${owner}_${repo}_${path}`, async () => {
    const content = await rawFetch(owner, repo, path);
    return content ? content.slice(0, 20000) : null;
  });
}

const COMPOSE_FILE = /(^|\/)(docker-)?compose([.-][a-z0-9_-]+)?\.ya?ml$/i;

export type ScanProgress = {
  phase: 'user' | 'repos' | 'languages' | 'trees' | 'manifests' | 'analyzing';
  current?: number;
  total?: number;
};

/**
 * Scan a user's public repos.
 * - Basic (no token): primary language + topics, plus root manifests fetched
 *   from raw.githubusercontent.com (2 API requests total).
 * - Deep (token): language breakdown, file trees, nested manifests and
 *   compose files for the top repos.
 */
export async function scanUser(
  username: string,
  token?: string,
  onProgress?: (progress: ScanProgress) => void,
  options?: {
    includeArchived?: boolean;
    /** Keep only the top-ranked repos in the result (keeps cached payloads small) */
    maxRepos?: number;
  },
): Promise<ScanResult> {
  const includeArchived = options?.includeArchived ?? true;
  const warnings: string[] = [];

  onProgress?.({ phase: 'user' });
  const user = await fetchUser(username, token);
  const owner = user.login;

  onProgress?.({ phase: 'repos' });
  const allRepos = await fetchRepos(owner, includeArchived, token);
  const repos = rankRepos(allRepos).slice(0, options?.maxRepos ?? Infinity);
  const signals = new Map<string, RepoSignals>(
    repos.map((r) => [r.name, {}]),
  );
  const deepRepos = new Set<string>();
  const treePaths = new Map<string, string[]>();

  // A rate-limit hit mid-scan degrades the result instead of failing it.
  let rateLimited = false;
  const guarded = async <T>(load: () => Promise<T>, fallback: T) => {
    if (rateLimited) return fallback;
    try {
      return await load();
    } catch (err) {
      if (err instanceof RateLimitError) {
        rateLimited = true;
        warnings.push(
          `${err.message} Showing a partial scan — results may be incomplete.`,
        );
      }
      return fallback;
    }
  };

  if (token) {
    const langRepos = repos.slice(0, DEEP_LANGUAGE_LIMIT);
    let done = 0;
    await mapLimit(langRepos, API_CONCURRENCY, async (repo) => {
      const langs = await guarded(
        () => fetchRepoLanguages(owner, repo.name, token),
        null,
      );
      if (langs) signals.get(repo.name)!.languages = langs;
      onProgress?.({ phase: 'languages', current: ++done, total: langRepos.length });
    });

    const treeRepos = repos.slice(0, DEEP_TREE_LIMIT);
    done = 0;
    await mapLimit(treeRepos, API_CONCURRENCY, async (repo) => {
      const paths = await guarded(
        () => fetchRepoTreePaths(owner, repo.name, token),
        null,
      );
      if (paths) {
        treePaths.set(repo.name, paths);
        signals.get(repo.name)!.paths = paths.map((p) => p.toLowerCase());
        deepRepos.add(repo.name);
      }
      onProgress?.({ phase: 'trees', current: ++done, total: treeRepos.length });
    });

    done = 0;
    const withTrees = treeRepos.filter((r) => deepRepos.has(r.name));
    await mapLimit(withTrees, RAW_CONCURRENCY, async (repo) => {
      const s = signals.get(repo.name)!;
      const originalPaths = treePaths.get(repo.name) ?? [];
      const manifestPaths = selectManifestPaths(originalPaths);
      const composePaths = originalPaths
        .filter((p) => COMPOSE_FILE.test(p) && p.split('/').length <= 3)
        .slice(0, 3);
      const [manifests, compose] = await Promise.all([
        Promise.all(manifestPaths.map((p) => fetchManifest(owner, repo.name, p))),
        Promise.all(composePaths.map((p) => fetchCompose(owner, repo.name, p))),
      ]);
      s.manifests = manifests.filter((m): m is ParsedManifest => Boolean(m));
      s.composeFiles = compose.filter((c): c is string => Boolean(c));
      onProgress?.({ phase: 'manifests', current: ++done, total: withTrees.length });
    });
  } else {
    // No tree without the API — probe the root manifest for the primary language
    const probeRepos = repos
      .filter((r) => !r.archived && r.language && ROOT_MANIFESTS_BY_LANGUAGE[r.language])
      .slice(0, BASIC_MANIFEST_LIMIT);
    let done = 0;
    await mapLimit(probeRepos, RAW_CONCURRENCY, async (repo) => {
      const candidates = ROOT_MANIFESTS_BY_LANGUAGE[repo.language!];
      const manifests = await Promise.all(
        candidates.map((p) => fetchManifest(owner, repo.name, p)),
      );
      signals.get(repo.name)!.manifests = manifests.filter(
        (m): m is ParsedManifest => Boolean(m),
      );
      onProgress?.({ phase: 'manifests', current: ++done, total: probeRepos.length });
    });
  }

  onProgress?.({ phase: 'analyzing' });
  const repoInfos = repos.map((repo) =>
    buildRepoInfo(repo, signals.get(repo.name)!, deepRepos.has(repo.name)),
  );

  return {
    user,
    repos: repoInfos,
    categories: aggregateSkills(repoInfos),
    totalRepos: allRepos.length,
    deepScannedRepos: deepRepos.size,
    mode: token ? 'deep' : 'basic',
    warnings,
  };
}
