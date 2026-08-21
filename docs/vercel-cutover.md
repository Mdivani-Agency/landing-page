# Vercel cutover for mdivani.agency

Do **not** change DNS until a Next.js preview deployment is verified. Firebase Hosting stays live until then. Full Eleventy/Firebase removal is [MDI-61](https://linear.app/mdivani/issue/MDI-61), after this cutover is confirmed.

Tracked on [MDI-60](https://linear.app/mdivani/issue/MDI-60).

## Current production (measured 2026-08-21)

| Record | Value |
| --- | --- |
| Apex `mdivani.agency` A | `199.36.158.100` (Firebase Hosting / Fastly) |
| `www.mdivani.agency` | Does **not** resolve — do not assume www is in use |
| Nameservers | `ns1.domain.com`, `ns2.domain.com` |
| HTTPS on apex | Working; last-modified around 2025-02-22 |

`origin/main` still builds the Eleventy site. Next.js lives on `development`. Until Next.js is merged to `main`, the Vercel **Production Branch** must be `development`.

## 1. Create the Vercel project (human)

1. Create a Vercel project and connect GitLab `mdivani-agency/landing-page`.
2. Framework: Next.js (auto-detected from `next.config.mjs`).
3. Install command (also in `vercel.json`): `corepack enable && yarn install --immutable`.
4. Build command: `yarn build` (Next.js). Output: `.next`.
5. Node.js: **22.x** in Project Settings → General (must match `.nvmrc` and `package.json` `engines.node`). Do not leave this on 24 — `firebase-tools` pulls in `superstatic@9`, which only allows Node 18, 20, or 22. If install fails with `Got "24.x"`, change the project Node version to 22.x and redeploy.
6. Set **Production Branch** to `development` until Next.js is on `main`.
7. Confirm a **Preview** deployment from this Next.js branch succeeds.
8. Confirm a **Production** deployment from `development` succeeds on the `*.vercel.app` URL.

If Corepack is skipped, set the Vercel project env `ENABLE_EXPERIMENTAL_COREPACK=1` and redeploy.

## 2. Environment variables (Vercel dashboard, not git)

Set for Production and Preview. Do not commit real values.

| Name | Value | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-PJ84DYZ4WS` | Existing public GA4 ID from the Eleventy site. Either this **or** the Firebase-named var is enough. |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | leave unset, or the same `G-…` ID | Optional alias. The app accepts either name. |

Local `.env` / `.env.example` stay empty so `yarn dev` does not send analytics.

## 3. Attach the custom domain (do not change DNS yet)

1. In the Vercel project, add `mdivani.agency`.
2. Do **not** add `www.mdivani.agency` unless you deliberately start using www (it does not resolve today).
3. Copy the apex A record Vercel shows. Typical Vercel apex A is `76.76.21.21` — **confirm on the domain card** before editing DNS.
4. Leave Firebase Hosting (`mdio-4a7c7`) serving the current site.

## 4. Lower TTL, then cut over

1. In Domain.com DNS, lower the apex A TTL (for example 300 seconds) and wait for the old TTL to expire.
2. Verify the Vercel production URL: homepage, `/privacy-policy`, `/terms-of-service`, calendar modal, analytics network call when the measurement ID is set.
3. Verify leftover-path redirects:
   - `/hero` and `/contact` → `/`
   - `/pravicy-statement` → `/privacy-policy`
4. Change the apex A from `199.36.158.100` to the Vercel IP from step 3.
5. Do not delete the Firebase project yet.
6. After DNS propagates, check `https://mdivani.agency`:
   - HTTPS certificate is valid
   - homepage, legal pages, calendar modal
   - `https://mdivani.agency/robots.txt` and `/sitemap.xml`
   - GA4 `page_view` on the live origin
7. Only after that, stop Firebase Hosting deploys (`yarn deploy` / `firebase deploy`). Removing Eleventy and Firebase config is MDI-61.

## 5. Rollback

Point the apex A back to `199.36.158.100`. Firebase Hosting still has the Eleventy site until MDI-61 removes it.
