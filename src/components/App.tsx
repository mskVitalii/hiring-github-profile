import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { trackAnalyticsEvent } from '../lib/analytics';
import {
  EMPTY_OAUTH_SESSION,
  type OAuthSession,
  type TokenSource,
} from '../lib/auth';
import type { ScanProgress } from '../lib/github';
import { getToken } from '../lib/token';
import type { ApiErrorResponse, ScanResult } from '../lib/types';
import ProgressBar from './ProgressBar';
import SearchBar from './SearchBar';

const UserCard = lazy(() => import('./UserCard'));
const SkillsList = lazy(() => import('./SkillsList'));
const MarkdownPreview = lazy(() => import('./MarkdownPreview'));

type AnalyticsConsent = 'granted' | 'denied' | null;

declare global {
  interface Window {
    __BASE_URL__?: string;
    va?: (...args: any[]) => void;
    setAnalyticsConsent?: (granted: boolean) => void;
  }
}

function getInitialUsernameFromLocation(): string {
  if (typeof window === 'undefined') return '';

  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('u')?.trim();
  if (fromQuery) return fromQuery;

  const base = window.__BASE_URL__ || '/';
  const path = window.location.pathname;
  const relative = path.startsWith(base) ? path.slice(base.length) : path;
  return relative.split('/').filter(Boolean)[0] ?? '';
}

function parseUsername(input: string): string {
  const raw = input.trim();
  if (!raw) return '';

  try {
    const url = new URL(raw);
    if (url.hostname.toLowerCase() === 'github.com') {
      const path = url.pathname.replace(/^\/+|\/+$/g, '');
      return path.split('/')[0] ?? '';
    }
  } catch {
    // Ignore URL parsing failures and fallback to plain username handling.
  }

  return raw.replace(/^@/, '').split('/')[0] ?? '';
}

function sendGaPageView(path: string): void {
  if (typeof window === 'undefined') return;
  trackAnalyticsEvent('page_view', {
    page_location: window.location.href,
    page_path: path,
    page_title: document.title,
  });
}

function sendVercelPageView(path: string): void {
  if (typeof window === 'undefined') return;
  if (typeof window.va !== 'function') return;

  window.va('pageview', {
    page_path: path,
    path,
    route: path,
  });
}

function setCanonicalProfilePath(username: string): void {
  if (typeof window === 'undefined') return;

  const clean = encodeURIComponent(username.trim());
  if (!clean) return;

  const base = window.__BASE_URL__ || '/';
  const targetPath = `${base}${clean}`.replace(/\/+/g, '/');
  const currentPath = window.location.pathname;

  if (currentPath === targetPath && !window.location.search) return;

  window.history.replaceState({}, '', targetPath);
  sendGaPageView(targetPath);
  sendVercelPageView(targetPath);
}

function setProfilePageTitle(displayName: string): void {
  if (typeof document === 'undefined') return;
  document.title = `${displayName} - GitHub Skills Scanner`;
}

function getInitialConsent(): AnalyticsConsent {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem('ga_consent');
  return value === 'granted' || value === 'denied' ? value : null;
}

function updateAnalyticsConsent(granted: boolean): AnalyticsConsent {
  if (
    typeof window !== 'undefined' &&
    typeof window.setAnalyticsConsent === 'function'
  ) {
    window.setAnalyticsConsent(granted);
  } else if (typeof window !== 'undefined') {
    window.localStorage.setItem('ga_consent', granted ? 'granted' : 'denied');
  }

  return granted ? 'granted' : 'denied';
}

function getTokenSource(
  personalToken: string | null,
  oauthSession: OAuthSession,
): TokenSource {
  if (personalToken) return 'pat';
  if (oauthSession.authenticated) return 'oauth';
  return 'none';
}

async function fetchOAuthSession(): Promise<OAuthSession> {
  try {
    const response = await fetch('/api/auth/session', {
      credentials: 'same-origin',
    });

    if (!response.ok) return EMPTY_OAUTH_SESSION;

    return (await response.json()) as OAuthSession;
  } catch {
    return EMPTY_OAUTH_SESSION;
  }
}

function consumeGithubAuthFlag(): boolean {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  const isGithubAuthRedirect = params.get('auth') === 'github';

  if (!isGithubAuthRedirect) return false;

  params.delete('auth');
  const nextSearch = params.toString();
  const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
  window.history.replaceState({}, '', nextUrl);

  return true;
}

async function scanWithOAuthSession(
  username: string,
  includeArchived: boolean,
): Promise<ScanResult> {
  const params = new URLSearchParams({
    username,
    includeArchived: String(includeArchived),
  });
  const response = await fetch(`/api/scan?${params.toString()}`, {
    credentials: 'same-origin',
  });

  if (!response.ok) {
    const data = (await response
      .json()
      .catch(() => null)) as ApiErrorResponse | null;
    throw new Error(data?.error || 'GitHub OAuth scan failed');
  }

  return (await response.json()) as ScanResult;
}

export default function App() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [includeArchived, setIncludeArchived] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [oauthSession, setOauthSession] =
    useState<OAuthSession>(EMPTY_OAUTH_SESSION);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [initialUsername, setInitialUsername] = useState('');
  const [hasAutoScanned, setHasAutoScanned] = useState(false);
  const [consent, setConsent] = useState<AnalyticsConsent>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>(
    'idle',
  );

  const tokenSource = getTokenSource(token, oauthSession);
  const hasToken = tokenSource !== 'none';

  useEffect(() => {
    let isMounted = true;

    setIsHydrated(true);
    const savedToken = getToken();
    const usernameFromLocation = getInitialUsernameFromLocation();

    setToken(savedToken);
    setInitialUsername(usernameFromLocation);
    setConsent(getInitialConsent());

    void (async () => {
      const session = await fetchOAuthSession();
      if (!isMounted) return;

      setOauthSession(session);
      setIsAuthLoading(false);

      if (consumeGithubAuthFlag() && session.authenticated) {
        trackAnalyticsEvent('oauth_login_completed', {
          has_token: true,
          token_source: 'oauth',
        });
      }

      if (!usernameFromLocation && session.authenticated && session.login) {
        setInitialUsername(session.login);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOAuthLogout = useCallback(async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const data = (await response
        .json()
        .catch(() => null)) as ApiErrorResponse | null;
      throw new Error(data?.error || 'Failed to disconnect GitHub');
    }

    const nextTokenSource = token ? 'pat' : 'none';

    setOauthSession(EMPTY_OAUTH_SESSION);
    trackAnalyticsEvent('oauth_logout', {
      has_token: nextTokenSource !== 'none',
      token_source: nextTokenSource,
    });
  }, [token]);

  const handleSearch = useCallback(
    async (input: string) => {
      const username = parseUsername(input);
      if (!username) return;

      trackAnalyticsEvent('scan_started', {
        has_token: hasToken,
        include_archived: includeArchived,
        token_source: tokenSource,
        trigger: 'search',
      });

      setIsLoading(true);
      setError(null);
      setResult(null);
      setProgress({ phase: 'user' });

      try {
        let scanResult: ScanResult;

        if (token) {
          const { scanUser } = await import('../lib/github');
          scanResult = await scanUser(username, token, setProgress, {
            includeArchived,
          });
        } else if (oauthSession.authenticated) {
          setProgress({ phase: 'repos' });
          scanResult = await scanWithOAuthSession(username, includeArchived);
        } else {
          const { scanUser } = await import('../lib/github');
          scanResult = await scanUser(username, undefined, setProgress, {
            includeArchived,
          });
        }

        const skillsDetected = scanResult.categories.reduce(
          (acc, category) => acc + category.skills.length,
          0,
        );

        trackAnalyticsEvent('scan_completed', {
          has_token: hasToken,
          include_archived: includeArchived,
          scanned_repos: scanResult.scannedRepos,
          token_source: tokenSource,
          total_repos: scanResult.totalRepos,
          skills_detected: skillsDetected,
        });

        setProfilePageTitle(
          scanResult.user.name?.trim() || scanResult.user.login,
        );
        setResult(scanResult);
        setCanonicalProfilePath(username);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
        setProgress(null);
      }
    },
    [hasToken, includeArchived, oauthSession.authenticated, token, tokenSource],
  );

  useEffect(() => {
    if (!isHydrated || !initialUsername || hasAutoScanned) return;
    setHasAutoScanned(true);
    void handleSearch(initialUsername);
  }, [handleSearch, hasAutoScanned, initialUsername, isHydrated]);

  const handleRecommendApp = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const basePath = (window.__BASE_URL__ || '/').replace(/\/?$/, '/');
    const shareUrl = new URL(basePath, window.location.origin);
    shareUrl.searchParams.set('utm_source', 'friend_share');
    shareUrl.searchParams.set('utm_medium', 'referral');
    shareUrl.searchParams.set('utm_campaign', 'recommend_app');

    const shareUrlString = shareUrl.toString();
    const shareMessage = `Generate a tech-stack README from your GitHub profile.\n\n${shareUrlString}`;

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: 'GitHub Skills Scanner',
          text: shareMessage,
          url: shareUrlString,
        });
        setShareStatus('shared');
        trackAnalyticsEvent('app_recommended', {
          method: 'share',
          share_url: shareUrlString,
        });
      } else {
        await navigator.clipboard.writeText(shareUrlString);
        setShareStatus('copied');
        trackAnalyticsEvent('app_recommended', {
          method: 'copy',
          share_url: shareUrlString,
        });
      }

      window.setTimeout(() => setShareStatus('idle'), 2500);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      try {
        await navigator.clipboard.writeText(shareUrlString);
        setShareStatus('copied');
        trackAnalyticsEvent('app_recommended', {
          method: 'copy_fallback',
          share_url: shareUrlString,
        });
        window.setTimeout(() => setShareStatus('idle'), 2500);
      } catch {
        trackAnalyticsEvent('app_recommend_failed', {
          share_url: shareUrlString,
        });
      }
    }
  }, []);

  return (
    <main className='min-h-screen flex flex-col'>
      {/* Header */}
      <header className='py-12 px-4 text-center'>
        <h1 className='text-3xl sm:text-4xl font-bold text-gh-text mb-2'>
          <span className='text-gh-accent'>GitHub</span> Skills Scanner
        </h1>
        <p className='text-gh-text-secondary max-w-md mx-auto'>
          Enter a GitHub username or profile URL to extract developer skills and
          technologies.
        </p>
      </header>

      {/* Search */}
      <section className='px-4'>
        <SearchBar
          onSearch={handleSearch}
          isLoading={isLoading}
          hasToken={hasToken}
          includeArchived={includeArchived}
          onIncludeArchivedChange={setIncludeArchived}
          onTokenChange={setToken}
          oauthAuthenticated={oauthSession.authenticated}
          oauthLogin={oauthSession.login}
          onOAuthLogout={handleOAuthLogout}
          isAuthLoading={isAuthLoading}
          initialValue={initialUsername}
        />
      </section>

      {/* Progress */}
      {isLoading && progress && (
        <section className='px-4'>
          <ProgressBar progress={progress} />
        </section>
      )}

      {/* Error */}
      {error && (
        <div className='max-w-xl mx-auto mt-6 px-4 py-3 rounded-lg border border-gh-red/50 bg-gh-red/10 text-gh-red text-sm'>
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <section className='px-4 py-8 space-y-8'>
          <Suspense
            fallback={
              <div className='text-center text-sm text-gh-text-secondary'>
                Loading results...
              </div>
            }
          >
            <UserCard
              user={result.user}
              totalRepos={result.totalRepos}
              scannedRepos={result.scannedRepos}
            />
            <SkillsList categories={result.categories} />
            <MarkdownPreview result={result} />
          </Suspense>
        </section>
      )}

      {/* Footer */}
      <footer className='mt-auto py-6 text-center text-sm text-gh-text/85 space-y-1'>
        <p>
          Made by{' '}
          <a
            href='https://www.linkedin.com/in/mskvitalii/'
            target='_blank'
            rel='noopener noreferrer'
            className='text-gh-accent underline underline-offset-2 decoration-1 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent/70 rounded-sm'
          >
            Vitalii Popov
          </a>
        </p>
        <p>
          Data from{' '}
          <a
            href='https://docs.github.com/en/rest'
            target='_blank'
            rel='noopener noreferrer'
            className='text-gh-accent underline underline-offset-2 decoration-1 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent/70 rounded-sm'
          >
            GitHub API
          </a>
          . Rate limit: 60 requests/hour without token.
        </p>
        <p>
          Like this tool?{' '}
          <a
            href='https://github.com/mskVitalii/hiring-github-profile'
            target='_blank'
            rel='noopener noreferrer'
            className='text-gh-accent underline underline-offset-2 decoration-1 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent/70 rounded-sm'
          >
            Star it on GitHub
          </a>
          .
        </p>
        <p>
          <button
            type='button'
            onClick={() => void handleRecommendApp()}
            className='text-gh-accent underline underline-offset-2 decoration-1 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent/70 rounded-sm'
          >
            {shareStatus === 'idle' && 'Recommend to a friend'}
            {shareStatus === 'copied' && 'Link copied'}
            {shareStatus === 'shared' && 'Shared'}
          </button>
        </p>
        <p className='flex items-center justify-center gap-3'>
          <a
            href='/privacy'
            className='text-gh-accent underline underline-offset-2 decoration-1 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent/70 rounded-sm'
          >
            Privacy Policy
          </a>
          <button
            type='button'
            onClick={() => setConsent(null)}
            className='text-gh-accent underline underline-offset-2 decoration-1 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent/70 rounded-sm'
          >
            Manage Cookies
          </button>
        </p>
      </footer>

      {isHydrated && consent === null && (
        <aside className='fixed inset-x-0 bottom-0 z-50 border-t border-gh-border/70 bg-gh-card/95 backdrop-blur px-4 py-3'>
          <div className='mx-auto max-w-5xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm text-gh-text-secondary'>
              I use Google Analytics to understand product usage and improve the
              scanner. Read the{' '}
              <a
                href='/privacy'
                className='text-gh-accent underline underline-offset-2 decoration-1 hover:decoration-2'
              >
                Privacy Policy
              </a>
              .
            </p>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setConsent(updateAnalyticsConsent(false))}
                className='px-3 py-2 rounded-md border border-gh-border text-gh-text-secondary hover:text-gh-text'
              >
                Decline
              </button>
              <button
                type='button'
                onClick={() => setConsent(updateAnalyticsConsent(true))}
                className='px-3 py-2 rounded-md bg-gh-accent text-gh-bg font-semibold hover:opacity-90'
              >
                Accept
              </button>
            </div>
          </div>
        </aside>
      )}
    </main>
  );
}
