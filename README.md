# mdivani.agency

Personal AI engineering and product studio for Mdivani Agency. The site presents Giorgi Mdivani as Founder & Lead AI Engineer. Next.js (App Router) on Vercel.

## Requirements

- Node.js 22.x (see `.nvmrc` and `package.json` `engines`)
- Yarn (Berry) — pinned via `packageManager`. Run `corepack enable` once so `yarn` resolves to the pinned version.

## Install

```bash
corepack enable
yarn install --immutable
```

## Scripts

```bash
yarn dev      # Next.js dev server at http://localhost:3000
yarn build    # production build (.next/)
yarn start    # serve the production build
yarn lint     # ESLint (eslint-config-next)
```

## Structure

- `app/` — App Router routes, metadata, `globals.css`
- `components/` — header, footer, calendar modal, homepage sections, legal pages
- `lib/` — site copy/URLs, analytics, and Supabase helpers
- `supabase/` — CLI config and SQL migrations
- `public/assets/` — favicon and images
- Tailwind via `tailwind.config.js` + `postcss.config.js`

Analytics uses GA4/gtag with `NEXT_PUBLIC_GA_MEASUREMENT_ID` or `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`. Copy `.env.example` and leave the values empty to run locally without tracking.

Error monitoring uses Sentry (`@sentry/nextjs`). Set `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` to the project DSN. For readable production stack traces, add `SENTRY_AUTH_TOKEN` as a build-time secret (not `NEXT_PUBLIC_`) so source maps upload during `yarn build`.

Programmatic blog writes: [`docs/blog-write-api.md`](docs/blog-write-api.md) (`POST /api/posts`).

## Supabase

Project ref `fokgusrsmrhatfrdcasg`. Schema lives in `supabase/migrations/` and
is applied with the CLI; there is no local Docker stack in use.

```bash
supabase migration list --linked   # compare local files against the project
supabase db push                   # apply pending migrations
```

Both need an access token for the account that owns the project:
`SUPABASE_ACCESS_TOKEN=... supabase db push`. Exporting it per command keeps
`supabase login` pointed at whichever account you use elsewhere.

On the default branch, GitLab applies pending files in
`supabase/migrations/` after lint, test, and build pass and before the
Vercel deploy. That job needs `SUPABASE_ACCESS_TOKEN` and
`SUPABASE_PROJECT_REF` as CI/CD variables — see
[`docs/vercel-cutover.md`](docs/vercel-cutover.md).

`lib/supabase.ts` builds the clients. Reads go through
`SUPABASE_PUBLISHABLE_KEY`, which resolves to the `anon` role and stays subject
to row level security. Writes go through `SUPABASE_SECRET_KEY`, which bypasses
row level security and must never reach the browser — neither variable takes a
`NEXT_PUBLIC_` prefix.

Leftover Eleventy and retired marketing paths redirect permanently:

- `/hero` → `/`
- `/pravicy-statement` → `/privacy-policy`
- `/ai-engineering`, `/product-development`, `/startup-development` → `/how-i-work`

`/inquiry` is the contact form (posts to `POST /api/contact`). `/contact`
temporarily redirects there — do not make that redirect permanent; a
cached 308 from the old Eleventy `/contact` → `/` mapping is why the
form does not live at `/contact`.

## Vercel

Hosting notes: [`docs/vercel-cutover.md`](docs/vercel-cutover.md).

- Framework: Next.js
- Install: `node .yarn/releases/yarn-4.9.2.cjs install --immutable` (also in `vercel.json`)
- Build: `yarn build`
- Node.js: **22.x** in Project Settings
- Production Branch: `development` until Next.js is merged to `main`
- Env (Production and Preview, not git): `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-PJ84DYZ4WS`, plus the server-only contact form variables (`RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, and the Upstash / KV REST pair `KV_REST_API_URL` + `KV_REST_API_TOKEN`) and the Supabase trio (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`) — see [`docs/vercel-cutover.md`](docs/vercel-cutover.md)
