# Hiring GitHub Profile

Turn any GitHub profile into a recruiter-ready story in minutes.

Hiring GitHub Profile analyzes public repositories, detects real technologies from code signals, and produces a polished README.md section you can paste into your profile. It helps developers present their strengths clearly and helps hiring teams evaluate faster.

[![Repo Views](https://visitor-badge.laobi.icu/badge?page_id=mskvitalii.hiring-github-profile)](https://github.com/mskvitalii/hiring-github-profile)

Author: [Vitalii Popov](https://www.linkedin.com/in/mskvitalii/)

Live demo: https://hiring-github-profile.vercel.app/

## Why This Project

- Most GitHub profiles look incomplete even when the engineer is strong.
- Recruiters need fast, structured evidence of stack and experience.
- Manual README writing is slow and often outdated.
- This tool auto-builds a clear profile summary from real repository activity.

## How It Works

1. Enter a GitHub username or profile URL.
2. The system scans public repositories and language stats.
3. Skills are extracted and grouped into practical categories.
4. A clean markdown block is generated for your profile README.

## Who It Is For

- Developers who want a stronger GitHub profile
- Job seekers preparing for technical interviews
- Recruiters and hiring managers reviewing candidates quickly

## What You Get

- Structured skills overview with evidence links
- Copy-ready markdown for immediate profile update
- Better first impression for technical hiring

## Contributing

Contributions are welcome.

1. Fork repository
2. Create a branch: feat/your-change
3. Commit with clear message
4. Open a Pull Request

## Environment Variables

- `GITHUB_CLIENT_ID` - GitHub OAuth App client ID for `Login with GitHub`
- `GITHUB_CLIENT_SECRET` - GitHub OAuth App client secret used by the callback exchange
- `PUBLIC_GA_ID` - Google Analytics 4 Measurement ID (optional, format: `G-XXXXXXXXXX`)
- `PUBLIC_SENTRY_DSN` - browser Sentry DSN (optional)
- `ENABLE_SENTRY` - enables `@sentry/astro` integration at build time (`true`/`false`)
- `SENTRY_AUTH_TOKEN` - token for source map upload during build (optional)

Copy [.env.example](.env.example) to `.env` locally and fill in the GitHub OAuth values.

## GitHub OAuth

- The app supports `Login with GitHub` via a GitHub OAuth App.
- Required scope: `read:user` (scans read public data only)
- The OAuth access token is stored in secure, `httpOnly` cookies.
- OAuth-backed scans go through `/api/scan`, so the browser never reads the cookie token directly.
- Manual Personal Access Tokens still work and remain stored in `localStorage` as a fallback for existing users.

## Analytics Behavior

- Google Analytics is loaded only when `PUBLIC_GA_ID` is provided.
- Analytics storage is denied by default until user consent is provided.
- A consent banner is shown on first visit with `Accept` and `Decline` actions.
- In-app profile navigation sends manual `page_view` events to keep GA data accurate in SPA-like flows.
- Scan analytics now include whether auth is available and which source is used: anonymous, PAT, or GitHub OAuth.

## Repository Profile Checklist

To make the repository look complete for other developers, fill these GitHub fields:

- About description
- Website URL (live demo)
- Topics (for discovery)
- Social preview image (already prepared in public/og-image.png)
- Issue templates
- Pull request template
