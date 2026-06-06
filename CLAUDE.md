# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server (localhost:4321)
npm run build    # static build → dist/
npm run preview  # preview dist/
npm run test     # run vitest tests (vitest run)
```

No linter script exists.

## Architecture

**Astro SSR site** (`output: 'server'`) deployed to Vercel. The entire UI is a single page — one Astro shell (`src/layouts/Layout.astro`) with one React island (`<App client:idle />`).

There is a thin server-side layer: OAuth auth routes (`src/pages/api/auth/`) and a proxied scan endpoint (`src/pages/api/scan.ts`) that run on Vercel serverless. When the user is not using OAuth, all GitHub API calls happen in the browser.

Build and install on Vercel use **bun** (`vercel.json` specifies `bun run build` / `bun install --frozen-lockfile`).

### Data flow

1. User enters a GitHub username → `App.tsx` calls `scanUser()` from `src/lib/github.ts` **or** `scanWithOAuthSession()` which calls `/api/scan`
2. `scanUser()` fetches user profile + repos via GitHub REST API, then (if a token is provided) fetches per-repo language breakdowns and file trees in parallel using a custom `pLimit` (12 concurrent for languages, 8 for file trees, 6 for compose operations)
3. Skills are detected in `detectSkillsFromRepos()` via four signals: primary language, language breakdown, topic/description keyword matching (`TECH_KEYWORDS` in `src/lib/keywords.ts`), and repo file tree patterns (infra/testing tools)
4. Results are categorized via `SKILL_CATEGORIES` and returned as `ScanResult`
5. `App.tsx` lazy-renders `UserCard`, `SkillsList`, and `MarkdownPreview`
6. `generateMarkdown()` in `src/lib/markdown.ts` builds GitHub-flavored markdown with shields.io badges

GitHub API responses are cached in `localStorage` for 1 hour.

### Auth modes

| Mode | Token source | Scan execution |
|---|---|---|
| No token | — | Client-side; only primary language + topics (~1–3 requests) |
| PAT | `localStorage` (via `src/lib/token.ts`) | Client-side; full language + file-tree scan |
| GitHub OAuth | httpOnly cookie (`gh_oauth_token`) | Server-side via `/api/scan`; same full scan |

OAuth flow: `GET /api/auth/login` → GitHub → `GET /api/auth/callback` (exchanges code, sets cookie) → redirect home with `?auth=github`. `GET /api/auth/session` returns the current session state. `POST /api/auth/logout` clears the cookie.

### URL routing

Profiles are addressable via path (`/:username`) or query param (`?u=username`). On scan, the URL is rewritten with `history.replaceState`. The base URL is injected at build time via `data-base-url` on `<body>` and read as `window.__BASE_URL__`.

### Key source files

| Path | Purpose |
|---|---|
| `src/components/App.tsx` | Root React island; orchestrates auth, scan, results |
| `src/components/SearchBar.tsx` | Username input + token/OAuth controls |
| `src/components/TokenInput.tsx` | PAT input UI |
| `src/components/GitHubLoginButton.tsx` | OAuth login/logout button |
| `src/components/ProgressBar.tsx` | Scan progress indicator |
| `src/components/UserCard.tsx` | User profile card |
| `src/components/SkillsList.tsx` | Detected skills grouped by category |
| `src/components/MarkdownPreview.tsx` | Generated markdown + copy button |
| `src/lib/github.ts` | GitHub REST API client, `scanUser()`, `detectSkillsFromRepos()` |
| `src/lib/keywords.ts` | `TECH_KEYWORDS` and `SKILL_CATEGORIES` |
| `src/lib/markdown.ts` | `generateMarkdown()` |
| `src/lib/auth.ts` | OAuth cookie names, `TokenSource` type, cookie helpers |
| `src/lib/token.ts` | PAT `saveToken` / `getToken` / `clearToken` (localStorage) |
| `src/lib/types.ts` | Shared TypeScript types (`ScanResult`, `GitHubUser`, etc.) |
| `src/lib/analytics.ts` | `trackAnalyticsEvent()` wrapper |
| `src/lib/logger.ts` | Logging utilities |
| `src/lib/github.test.ts` | Vitest unit tests for github.ts |
| `src/pages/api/auth/login.ts` | OAuth login redirect |
| `src/pages/api/auth/callback.ts` | OAuth code exchange, sets httpOnly cookie |
| `src/pages/api/auth/logout.ts` | Clears OAuth cookie |
| `src/pages/api/auth/session.ts` | Returns current OAuth session |
| `src/pages/api/scan.ts` | Server-side scan proxy (requires OAuth cookie) |

### Adding new technology detection

- Add keywords to `TECH_KEYWORDS` in `src/lib/keywords.ts` for topic/description-based detection
- Add the skill name to a category in `SKILL_CATEGORIES` to control where it appears
- Add file-tree patterns inside `detectSkillsFromRepos()` in `src/lib/github.ts` for infra/tooling detection (e.g., config files, directories)

## Environment variables

| Variable | Used in | Purpose |
|---|---|---|
| `GITHUB_CLIENT_ID` | `src/pages/api/auth/login.ts`, `callback.ts` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | `src/pages/api/auth/callback.ts` | GitHub OAuth App client secret (server-only) |
| `PUBLIC_SENTRY_DSN` | `sentry.client.config.js` | Sentry DSN (browser-accessible) |
| `ENABLE_SENTRY` | `astro.config.mjs` | Gates `@sentry/astro` integration at build time (`true`/`false`) |
| `SENTRY_AUTH_TOKEN` | `astro.config.mjs` | Sentry source map upload (build-time only, never goes to browser) |
| `PUBLIC_GA_ID` | `src/layouts/Layout.astro` | Google Analytics 4 ID (optional) |

Sentry is enabled only when `ENABLE_SENTRY=true`. The `sentry.server.config.js` exists for completeness but carries minimal logic since the only true server-side code is the thin auth/scan API layer.
