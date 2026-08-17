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

```bash
yarn dev      # start the dev server at http://localhost:3000
yarn build    # production build (.next/)
yarn start    # serve the production build
yarn lint     # run ESLint (eslint-config-next)
```

Structure:

- `app/` — App Router entry (`layout.tsx`, `page.tsx`, `globals.css`)
- `components/` — reusable UI (added as sections are ported)
- Tailwind CSS is configured via `tailwind.config.js` + `postcss.config.js`; TypeScript via `tsconfig.json`.

## Legacy Eleventy site

Still available while the migration is in progress:

```bash
yarn dev:eleventy    # eleventy --serve (http://localhost:8080)
yarn build:eleventy  # compile Tailwind + build the Eleventy site into public/
yarn tw              # watch/recompile src/styles.css
yarn deploy          # build the Eleventy site and deploy to Firebase Hosting
```

Eleventy sources live in `src/` and build to `public/`.
