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
- `deploy_production` runs only on the default branch, only after all three
  check jobs pass, and deploys with the Vercel CLI
  (`vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod`).
- `vercel.json` sets `git.deploymentEnabled` to `false` for `development` and
  `main`, so the Vercel Git integration no longer auto-deploys the production
  branch. Other branches still get preview deploys from the Git integration.

Required GitLab CI/CD variables (Settings → CI/CD → Variables, masked):

| Name | Value |
| --- | --- |
| `VERCEL_TOKEN` | Vercel account token with deploy access to the project |
| `VERCEL_ORG_ID` | From the Vercel project settings (`vercel link` writes it to `.vercel/project.json`) |
| `VERCEL_PROJECT_ID` | Same source as `VERCEL_ORG_ID` |

If the Vercel production branch moves from `development` to `main`, also move
the GitLab default branch (the deploy job follows `$CI_DEFAULT_BRANCH`).

## Environment variables (dashboard, not git)

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-PJ84DYZ4WS` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | optional alias; leave unset if the GA var is set |

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
