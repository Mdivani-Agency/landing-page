# Vercel hosting for mdivani.agency

The marketing site deploys from this repo as a Next.js app on Vercel. Eleventy and Firebase Hosting config have been removed from the repo (MDI-61). An already-deployed Firebase Hosting site is not deleted by that cleanup.

## Project settings

- GitHub (source of truth): [Mdivani-Agency/landing-page](https://github.com/Mdivani-Agency/landing-page)
- Default branch: `development`
- Framework: Next.js
- Install: `node .yarn/releases/yarn-4.9.2.cjs install --immutable`
- Build: `yarn build`
- Node.js: **22.x** (`.nvmrc` / `engines.node`)
- Production Branch: `development` until Next.js is merged to `main`

Do not set a dashboard Install Command that runs classic Yarn 1.

GitLab CI (`.gitlab-ci.yml`) is retired. Do not add new jobs there.

## CI-gated production deploys (MDI-68)

Production deploys are gated on GitHub Actions in `.github/workflows/ci.yml`:

- `lint`, `test`, and `build` run as required jobs on every pull request and
  on every push to `development`. Feature-branch work is checked via the
  `pull_request` event so a branch with an open PR does not also get a
  duplicate `push` pipeline.
- `migrate_supabase` runs only on push to `development`, after `lint`,
  `test`, and `build` succeed, and before `deploy_production`. It links
  with `SUPABASE_PROJECT_REF` and applies pending migrations via
  `supabase db push` (CLI `2.116.0`). The job is not gated on a file glob —
  `db push` is idempotent, and a glob would skip retries after a failed
  apply. A `concurrency` group (`supabase-migrations`) serializes applies
  so two workflows cannot race. After the group is acquired, the job
  skips `db push` unless `github.sha` is still `origin/development`.
  `timeout-minutes: 20` stops a hung CLI from holding the group for the
  runner default (6 hours).
- `deploy_production` runs only on push to `development`, only after all
  three check jobs pass and after `migrate_supabase`, and deploys with the
  Vercel CLI (`vercel pull` → `vercel build --prod` →
  `vercel deploy --prebuilt --prod`). The CLI reads `VERCEL_ORG_ID` and
  `VERCEL_PROJECT_ID` from the job environment (never `--project` or
  `--token` on argv). The project is a Hobby personal account (`mdivani1`
  is the username, not a team). Do not pass `--scope mdivani1` — on Hobby
  the CLI rejects a personal account as `--scope`. The CLI version is
  pinned in `devDependencies` and authenticates via the `VERCEL_TOKEN`
  environment variable. A `concurrency` group (`vercel-production`)
  serializes deploys. After the group is acquired, the job skips deploy
  unless `github.sha` is still `origin/development`, so a slower older
  run cannot overwrite a newer production deploy. `timeout-minutes: 20`
  matches migrate.
- `vercel.json` sets `git.deploymentEnabled` to `false` for `development`
  and `main`, so the Vercel Git integration no longer auto-deploys those
  branches. Keep that. Other branches still get preview deploys from the
  Vercel Git integration.

Do not change Vercel dashboard git settings or deploy production from a
laptop; production stays CI-gated.

### GitHub Actions secrets

Create these in the GitHub repo. Do not commit values. **Do not use
repository secrets** for these tokens. Same-repo `pull_request` workflows
can read repository `secrets.*`, including from a branch that edits
`.github/workflows/ci.yml`. Environment secrets are only injected when a
job declares that environment, and only if the ref is allowed.

Create a GitHub Environment named **`production`** with URL
`https://mdivani.agency`. Restrict **Deployment branches** to `development`
only. Put the Vercel trio on that environment only (`Settings` →
`Environments` → `production` → `Environment secrets`).
`deploy_production` declares `environment: production`, so only that job
receives them, and only from `development`:

| Name | Where | What to set |
| --- | --- | --- |
| `VERCEL_TOKEN` | Environment `production` | Personal account token for the Hobby user that owns the project |
| `VERCEL_ORG_ID` | Environment `production` | That user's id from `.vercel/project.json` `orgId` (same value as `GET /v2/user` → `user.id`). **Not** the dashboard username (`mdivani1`) and **not** a `team_…` id — this project has no team. A username here makes `vercel pull` fail with `Project not found`. |
| `VERCEL_PROJECT_ID` | Environment `production` | Project id from the same file (`prj_…`). |

A preflight exits if any of the three Vercel secrets is missing. Set
`VERCEL_ORG_ID` to the user's `user.id`, not the dashboard username.

`migrate_supabase` uses a separate Environment named **`supabase`** (not
`production`). Restrict **Deployment branches** to `development` only. Put
these on that environment (`Settings` → `Environments` → `supabase` →
`Environment secrets`):

| Name | Where | What to set |
| --- | --- | --- |
| `SUPABASE_ACCESS_TOKEN` | Environment `supabase` | Personal access token for the account that owns the hosted project. Used by `migrate_supabase` (`supabase link` / `db push`). |
| `SUPABASE_PROJECT_REF` | Environment `supabase` | Hosted project ref (20-character id from the dashboard URL). Same value as the ref in `README.md`. |

Protect `development` and require the `lint`, `test`, and `build` checks
so a red workflow cannot merge. `.github/CODEOWNERS` lists the write-access
owner for `.github/`; it does not block merges until branch protection
requires a review from Code Owners (and, if you want a non-author review,
from someone other than the last pusher). That dashboard step is TD-053.

If the Vercel production branch moves from `development` to `main`, update
`on.push.branches` and the `migrate_supabase` / `deploy_production` `if:`
conditions in `.github/workflows/ci.yml` to match, and move the GitHub
default branch.

## Environment variables (dashboard, not git)

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-PJ84DYZ4WS` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | optional alias; leave unset if the GA var is set |
| `RESEND_API_KEY` | Resend API key for `POST /api/contact` (server-only, MDI-77) |
| `CONTACT_FROM_EMAIL` | From address on the Resend-verified `sales.mdivani.agency` domain, e.g. `noreply@sales.mdivani.agency` (the display name lives in code) |
| `CONTACT_TO_EMAIL` | Inbox that receives inquiries, e.g. `giorgi@mdivani.agency` |
| `KV_REST_API_URL` | REST URL from the Vercel Upstash / KV integration (used to rate-limit `POST /api/contact`). `UPSTASH_REDIS_REST_URL` is an equivalent alias. |
| `KV_REST_API_TOKEN` | Matching write-capable REST token (`UPSTASH_REDIS_REST_TOKEN` is the alias). Do not use `KV_REST_API_READ_ONLY_TOKEN`. |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for the `landing-page` project (browser). Same value as `SENTRY_DSN`. |
| `SENTRY_DSN` | Sentry DSN for server and edge runtimes. |
| `SENTRY_AUTH_TOKEN` | Build-only source map upload token (server-only). Create at https://mdio.sentry.io/settings/auth-tokens/ |
| `SUPABASE_URL` | `https://fokgusrsmrhatfrdcasg.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` key for reads; resolves to the `anon` role and stays subject to row level security |
| `SUPABASE_SECRET_KEY` | `sb_secret_…` key for server-side writes (`blog_posts` and `inquiries`); bypasses row level security, so never expose it to the browser |
| `BLOG_WRITE_TOKEN` | Set after `migrate_supabase` has applied `blog_posts` (TD-044 / TD-045). At least 32 random bytes, server-only. Until the table is live, leave unset so `POST /api/posts` returns 500 instead of writing into a missing relation |

The contact and Supabase variables are server-only — never prefix them with
`NEXT_PUBLIC_`. The Vercel Upstash Redis integration also writes
`KV_URL`, `REDIS_URL`, and `KV_REST_API_READ_ONLY_TOKEN`; those are unused
by this app. Without a REST URL+token pair the route falls back to a
best-effort in-memory rate limit that does not hold across serverless
isolates, so keep the integration vars on Production before enabling
sends (or add an equivalent Vercel Firewall rule for `/api/contact`).

Local `.env` / `.env.example` stay empty so `yarn dev` does not send analytics.

## Custom domain

`www.mdivani.agency` does not resolve today — attach `mdivani.agency` only unless you start using www.

If the apex A is still `199.36.158.100` (Firebase Hosting / Fastly):

1. Confirm the Vercel production URL (homepage, legal pages, calendar, leftover redirects, analytics).
2. Copy the apex A from the Vercel domain card (typical `76.76.21.21` — confirm there).
3. Lower TTL, then point the apex A at that Vercel IP.
4. After HTTPS is valid on `https://mdivani.agency`, check `/robots.txt`, `/sitemap.xml`, and GA4.
5. Disable Firebase Hosting for site `mdio-4a7c7` in the Firebase console. Do not run `firebase deploy` from this repo.

## Rollback

While Firebase Hosting still has the last Eleventy deploy, point the apex A back to `199.36.158.100`. After that hosting site is disabled, roll back by reverting the Vercel production deployment instead.
