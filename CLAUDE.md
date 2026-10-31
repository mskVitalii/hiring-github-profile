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

1. User enters a GitHub username (or clicks a profile in the gallery) → `App.tsx` calls `scanUser()` from `src/lib/github.ts` **or** `scanWithOAuthSession()` which calls `/api/scan`
2. `scanUser()` fetches the user + non-fork repos, ranks them (`rankRepos`: active → stars → last push), then gathers signals per repo:
   - **Basic (no token)**: primary language + topics, plus the root manifest for the primary language fetched from `raw.githubusercontent.com` (does not count against the REST rate limit)
   - **Deep (token)**: language breakdown (top 80 repos), recursive file tree (top 40), nested manifests and docker compose files via raw
   - A rate-limit hit mid-scan degrades to a partial result with `warnings` instead of failing
3. `detectRepoTechs()` in `src/lib/detect.ts` turns signals into techs, strongest first: manifests → linguist languages (≥5% share) → file patterns → compose images → topics/description (whole-word only). Programming languages come **only** from linguist data. Ecosystem-bound frameworks are attributed to a language (`React → TypeScript`) and topic/description matches are dropped when that language is absent
4. `aggregateSkills()` merges repos into `SkillCategory[]`; `ScanResult.repos` keeps per-repo techs with their sources
5. `ProfileEditor` holds README settings (`localStorage` `hgp_settings_v2`) and per-profile selection — hidden skills, custom skills, excluded repos (`hgp_profile_v2_<login>`)
6. `generateMarkdown(result, settings, selection)` in `src/lib/markdown.ts` builds the README: skill badges, projects (once each with stack, or under each skill), list/table layouts

GitHub API responses and parsed manifests are cached in `localStorage` for 1 hour (`gh2_` prefix).

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
| `src/components/App.tsx` | Root React island; orchestrates auth, scan, results, gallery |
| `src/components/ProfileEditor.tsx` | Owns README settings/selection state; wires the editor components |
| `src/components/SkillsList.tsx` | Detected skills; click toggles a skill out of the README |
| `src/components/CustomizePanel.tsx` | README options + "add a skill" |
| `src/components/ProjectPicker.tsx` | Include/exclude repos |
| `src/components/MarkdownPreview.tsx` | Preview/raw markdown, copy, post-copy popup, safe GFM renderer |
| `src/components/Gallery.tsx` | Famous developers grid (data in `src/lib/gallery.ts`) |
| `src/components/SearchBar.tsx`, `TokenInput.tsx`, `GitHubLoginButton.tsx` | Username input, PAT and OAuth controls |
| `src/lib/catalog/` | **Single source of truth for techs**: category, ecosystem languages, linguist names, topics, keywords, deps, file patterns, compose regex, implications, badge |
| `src/lib/detect.ts` | Pure detection + aggregation + repo ranking |
| `src/lib/manifests.ts` | Parsers for package.json, go.mod, pyproject/requirements, Cargo, Gemfile, composer, pubspec, pom/gradle, csproj, mix.exs |
| `src/lib/github.ts` | GitHub REST/raw client and `scanUser()` orchestration |
| `src/lib/markdown.ts` | `generateMarkdown()`, `visibleCategories()`, `skillLabel()` |
| `src/lib/settings.ts` | `MarkdownSettings`, `ProfileSelection` and defaults |
| `src/lib/types.ts` | Shared types (`ScanResult`, `RepoInfo`, `Skill`, …) |
| `src/lib/*.test.ts` | Vitest tests for detection, manifests and markdown |
| `src/pages/api/scan.ts` | Server-side scan proxy (requires OAuth cookie) |
| `src/pages/api/auth/*` | OAuth login / callback / session / logout |

### Adding new technology detection

Add one `TechDef` entry to the right file in `src/lib/catalog/`:

- `langs` — ecosystem languages (omit for language-agnostic tools like Docker); required for anything that only exists in one ecosystem, otherwise topics like `gin` leak into unrelated repos
- `deps` — package names per ecosystem (`'@nestjs/*'` prefix match) — the most reliable signal
- `files` / `compose` — tree path regexes (paths are lower-cased) and compose image regex
- `topics` — exact GitHub topic slugs; `keywords` — only unambiguous whole-word phrases for descriptions
- `implies`, `badge` (`[color, simple-icons slug, logoColor]`)

Add a test case in `src/lib/detect.test.ts` for anything with a false-positive risk.

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
