# Vercel hosting for mdivani.agency

The marketing site deploys from this repo as a Next.js app on Vercel. Eleventy and Firebase Hosting config have been removed from the repo (MDI-61). An already-deployed Firebase Hosting site is not deleted by that cleanup.

## Project settings

- GitLab: `mdivani-agency/landing-page`
- Framework: Next.js
- Install: `node .yarn/releases/yarn-4.9.2.cjs install --immutable`
- Build: `yarn build`
- Node.js: **22.x** (`.nvmrc` / `engines.node`)
- Production Branch: `development` until Next.js is merged to `main`

Do not set a dashboard Install Command that runs classic Yarn 1.

## CI-gated production deploys (MDI-68)

Production deploys are gated on the GitLab pipeline in `.gitlab-ci.yml`:

- `lint`, `test`, and `build` run as required jobs on every push and merge
  request.
- `migrate_supabase` runs only on the default branch (`$CI_DEFAULT_BRANCH`,
  currently `development`), after `lint`, `test`, and `build` succeed, and
  before `deploy_production`. It links with `SUPABASE_PROJECT_REF` and
  applies pending migrations via `supabase db push` (CLI `2.116.0`). The
  job is not gated on a file glob — `db push` is idempotent, and a glob
  would skip retries after a failed apply. A `resource_group` serializes
  applies so two pipelines cannot race.
- `deploy_production` runs only on the default branch, only after all three
  check jobs pass and after `migrate_supabase` when that job is in the
  pipeline, and deploys with the Vercel CLI
  (`vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod`,
  each with `--project` set from the GitLab `VERCEL_PROJECT_ID` variable).
  The project is a Hobby personal account (`mdivani1` is the username, not a
  team). Do not pass `--scope mdivani1` — on Hobby the CLI rejects a personal
  account as `--scope`. The CLI version is pinned in `devDependencies` and
  authenticates via the `VERCEL_TOKEN` environment variable (never `--token`
  on argv). A `resource_group` serializes deploys so an older pipeline cannot
  overwrite a newer one.
- `vercel.json` sets `git.deploymentEnabled` to `false` for `development` and
  `main`, so the Vercel Git integration no longer auto-deploys the production
  branch. Other branches still get preview deploys from the Git integration.

Required GitLab CI/CD variables (Settings → CI/CD → Variables). The project is
public, so tokens must stay off feature-branch and merge-request pipelines.

The Vercel trio must be **protected**, **masked**, and scoped to the
**`production` environment**. Masking only redacts logs; protection plus
environment scoping keep the token out of jobs that do not declare
`environment: name: production` (`deploy_production` does):

| Name | Value |
| --- | --- |
| `VERCEL_TOKEN` | Personal account token for the Hobby user that owns the project |
| `VERCEL_ORG_ID` | That user's id from `.vercel/project.json` `orgId` (same value as `GET /v2/user` → `user.id`). **Not** the dashboard username (`mdivani1`) and **not** a `team_…` id — this project has no team. A username here makes `vercel pull` fail with `Project not found`. |
| `VERCEL_PROJECT_ID` | Project id from the same file (`prj_…`). |

`deploy_production` passes `--project` from `VERCEL_PROJECT_ID` and unsets `VERCEL_ORG_ID` before the CLI, so a username-as-org-id cannot block production. A preflight logs match/mismatch flags only and does not print id values.

`migrate_supabase` does not declare an environment. These two must be
**protected** and **masked**, available on the protected default branch, and
**not** scoped only to `production`:

| Name | Value |
| --- | --- |
| `SUPABASE_ACCESS_TOKEN` | Personal access token for the account that owns the hosted project. Used by `migrate_supabase` (`supabase link` / `db push`). |
| `SUPABASE_PROJECT_REF` | Hosted project ref (20-character id from the dashboard URL). Same value as the ref in `README.md`. |

The default branch must stay a protected branch so protected variables are
available to `deploy_production` and `migrate_supabase`. Enable the GitLab MR
setting **Pipelines must succeed** to make the check jobs merge-blocking as
well.

If the Vercel production branch moves from `development` to `main`, also move
the GitLab default branch (the deploy job follows `$CI_DEFAULT_BRANCH`).

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
| `SUPABASE_SECRET_KEY` | `sb_secret_…` key for server-side writes; bypasses row level security, so never expose it to the browser |
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
