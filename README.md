# mdivani.agency

Marketing landing page for Mdivani / mdio.

The site is being migrated from Eleventy (11ty) to **Next.js (App Router)**. See Linear [MDI-52](https://linear.app/mdivani/issue/MDI-52) for the migration plan. During the migration both stacks live in the repo: Next.js is the new primary app, and the legacy Eleventy commands remain available under `*:eleventy` scripts until the cleanup task (MDI-61).

## Requirements

- Node.js 22+
- Yarn (Berry) — pinned via `packageManager` in `package.json`. Run `corepack enable` once so `yarn` resolves to the pinned version.

## Install

```bash
corepack enable
yarn install --immutable
```

## Next.js app (primary)

`yarn build` and `yarn start` now target **Next.js**, not Eleventy. They do not rebuild the marketing site for Firebase.

```bash
yarn dev      # start the Next.js dev server at http://localhost:3000
yarn build    # Next.js production build (.next/) — not the Eleventy site
yarn start    # serve the Next.js production build
yarn lint     # run ESLint (eslint-config-next)
```

`public/` is reserved for Next.js static assets (favicon, images). Do not write Eleventy output there.

Structure:

- `app/` — App Router entry (`layout.tsx`, `page.tsx`, `globals.css`)
- `components/` — reusable UI (added as sections are ported)
- Tailwind CSS is configured via `tailwind.config.js` + `postcss.config.js`; TypeScript via `tsconfig.json`.
- Design tokens live in `app/globals.css` (`:root` CSS variables) and `tailwind.config.js`. Roboto is loaded with `next/font/google`. Static images stay under `public/assets/`.

## Legacy Eleventy site

Still available while the migration is in progress. Firebase Hosting continues to serve this build until the Vercel cutover (MDI-60 / MDI-61).

```bash
yarn dev:eleventy    # eleventy --serve (http://localhost:8080)
yarn build:eleventy  # compile Tailwind + build the Eleventy site into eleventy-dist/
yarn tw              # watch/recompile src/styles.css
yarn deploy          # rebuild Eleventy, then deploy eleventy-dist/ to Firebase
```

Eleventy sources live in `src/` and build to `eleventy-dist/` (gitignored). `firebase.json` also runs `yarn build:eleventy` as a hosting predeploy hook, so a bare `npx firebase deploy` still refreshes the marketing site.

Do **not** use `yarn build && npx firebase deploy` — `yarn build` is Next.js and will not update `eleventy-dist/`. Use `yarn deploy` or `yarn build:eleventy`.
