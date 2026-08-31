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
- `lib/` — site copy/URLs and analytics helpers
- `public/assets/` — favicon and images
- Tailwind via `tailwind.config.js` + `postcss.config.js`

Analytics uses GA4/gtag with `NEXT_PUBLIC_GA_MEASUREMENT_ID` or `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`. Copy `.env.example` and leave the values empty to run locally without tracking.

Leftover Eleventy paths redirect permanently:

- `/hero` → `/`
- `/pravicy-statement` → `/privacy-policy`

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
- Env (Production and Preview, not git): `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-PJ84DYZ4WS`, plus the server-only contact form variables (`RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, and the Upstash / KV REST pair `KV_REST_API_URL` + `KV_REST_API_TOKEN`) — see [`docs/vercel-cutover.md`](docs/vercel-cutover.md)
