# Technical Debt Register

Last audited: 2026-08-31  
Last updated: 2026-09-15 (MDI-140 review: TD-054 recorded)

This is a point-in-time static audit of the Next.js application, supporting
configuration, tests, and deployment documentation. It prioritizes observable
user impact, accessibility, search indexing, security, and maintenance cost.

## Validation snapshot

- `yarn install --immutable`: passes, with peer-dependency warnings.
- `yarn lint`: passes.
- `yarn tsc --noEmit`: passes.
- `yarn test` on the required Node.js 22 runtime: 15 files and 113 tests pass.
- `yarn build` on Node.js 22: passes.
- `yarn npm audit --environment production`: no production audit findings.
- Full dependency audit: multiple vulnerable build/development transitive
  dependencies, documented below.
- Browser, assistive-technology, and real-device testing were not performed.

Severity guide:

- **High**: broken user journey, significant accessibility/SEO failure, or
  material release/security risk.
- **Medium**: meaningful reliability, compliance, performance, or maintenance
  risk.
- **Low**: cleanup or consistency work with limited immediate user impact.

## Resolved

### TD-001 — Capability cards link to routes that do not exist

Resolved by retargeting AI and Product Engineering cards to `/how-i-work`.
Retired `/ai-engineering`, `/product-development`, and `/startup-development`
permanently redirect to `/how-i-work`.

### TD-002 — Sitemap is out of sync with actual routes

Resolved. `app/sitemap.ts` is generated from `navLinks` and `legalLinks` and
now includes `/how-i-work`. Ghost marketing URLs are no longer published.

### TD-003 — The About page has no page-level heading

Resolved. `/about` passes `headingAs="h1"` into `AboutGiorgi`. The homepage
About section remains an `<h2>` under the hero heading.

### TD-006 — `/how-i-work` contains stale migration code and a broken landmark

Resolved. Unused `capabilities` import removed, page renamed to
`HowIWorkPage`, and the unlabeled wrapper section replaced with a layout
`div`.

### TD-009 — Route and sitemap integrity are not covered by tests

Partially resolved. `lib/__tests__/content.test.ts` now requires capability
hrefs and sitemap URLs to match `publicPagePaths`. Remaining gap: the suite
does not scan `app/**/page.tsx` or assert the retired-path redirects.

### TD-010 — Contact backend has no user-facing form

Resolved independently of this cleanup. `/inquiry` hosts the contact form and
posts to `POST /api/contact`. `/contact` temporarily redirects to `/inquiry`.

### TD-023 — `lucide-react` is declared but unused

Resolved. The package is used for header, conversation, and greenfield icons.

### TD-008 — No repository CI enforces the existing quality gates

Resolved. `.gitlab-ci.yml` runs lint, test, and build on merge requests and
pushes, then deploys production from the default branch via the Vercel CLI
after those checks pass. Remaining CI gaps are tracked as TD-039.

### TD-046 — Blog write API still uses the in-memory store

Resolved in code. `lib/blog.ts` reads and writes `public.blog_posts` through
the Supabase clients and the module-level seed array is gone. `POST
/api/posts` looks up collisions with the admin client — row level security
hides drafts from the publishable key, so a read-client lookup would miss a
draft holding the slug and fail on the unique constraint instead of returning
409 — then revalidates `/blog`, `/blog/[slug]`, `/feed.xml`, and
`/sitemap.xml`. Persistence
failures return 500 and report to Sentry.

Outstanding and deliberate: `BLOG_WRITE_TOKEN` is still unset on Vercel. Set a
≥32-byte value only after `migrate_supabase` has applied the table
(TD-044, TD-045).

### TD-047 — Root Person JSON-LD does not escape `</script>`

Resolved. `app/layout.tsx` serializes the Person graph with `serializeJsonLd`
from `lib/metadata.ts`, matching the blog article and breadcrumb scripts. All
JSON-LD sinks now escape `<`.

### TD-048 — Blog read failures degrade silently and unmonitored

Resolved on the same change that introduced the risk, and recorded because the
design is deliberate rather than obvious.

`listPublishedPosts` and `getPostBySlug` swallow Supabase errors and return an
empty result instead of throwing, so `next build` succeeds in CI without
Supabase variables. That fallback is kept: an empty blog is a better CI
outcome than a failed build. The problem was that both blog pages are ISR with
`revalidate = 3600`, so a transient failure during a revalidation could serve
an empty listing for an hour with no signal, while the write path already
reported to Sentry.

Both read failure branches and the missing-credentials warning now call
`Sentry.captureException` with an `area: "blog-read"` tag, keeping the
empty-result fallback. `vitest.setup.ts` stubs `@sentry/nextjs` globally,
since its bundler plugin cannot resolve under Vitest; suites that assert on
reporting re-mock it locally.

## High priority

### TD-004 — Mobile navigation is not a complete accessible modal

**Severity:** High  
**Area:** Accessibility / Responsive UX

`components/header.tsx:37-46` locks scrolling, but the open mobile navigation
at `components/header.tsx:105-155` does not move or trap focus, make underlying
content inert, close on Escape, or restore focus to the trigger. If the viewport
is resized to desktop while the menu is open, CSS hides the menu but
`mobileOpen` remains true and the body remains scroll-locked.

**Impact:** Keyboard users can tab into obscured content, and resizing can leave
the visible desktop page unable to scroll.

**Remediation:** Treat the menu as a modal navigation surface: move focus on
open, trap focus, set the rest of the page inert, support Escape, restore focus,
and close automatically when the `lg` breakpoint is reached. Prefer a tested
dialog/sheet primitive if adding a UI dependency is acceptable.

### TD-005 — Auto-hidden header keeps invisible controls focusable

**Severity:** High  
**Area:** Accessibility

`components/header.tsx:20-34` hides the header based on scroll direction.
`components/header.tsx:53-56` only translates it offscreen and sets opacity;
its links and buttons remain in the tab order.

**Impact:** Keyboard focus can move to controls that are not visible.

**Remediation:** Reveal the header when it receives focus, or make it
non-interactive while hidden using `inert`/visibility handling. Do not use
`aria-hidden` while descendants can still receive focus.

## Medium priority

### TD-007 — Build/development dependency audit reports known vulnerabilities

**Severity:** Medium  
**Area:** Supply chain / Tooling

The full Yarn audit reports high/critical advisories in build-time transitive
packages including `postcss@8.5.1`, `nanoid@3.3.8`, `minimatch`, `glob`, and
`tar@7.4.3`. `postcss@8.5.1` is pinned directly in `package.json`; `tar` arrives
through `node-gyp`/`cacache`. The production-only audit is clean, so these are
not currently shipped runtime vulnerabilities.

**Impact:** Local and CI tooling processes potentially unsafe inputs with known
vulnerable versions. Risk is lower because the site builds trusted local
sources, but the maintenance backlog is real.

**Remediation:** Upgrade direct build dependencies, regenerate the lockfile,
review remaining transitive paths, and run production plus full audits in CI.
Do not use resolutions blindly; confirm upstream compatibility.

### TD-011 — Contact abuse protection depends on deployment configuration

**Severity:** Medium  
**Area:** Reliability / Abuse prevention

`lib/rate-limit.ts:131-159` falls back to an isolate-local in-memory limit if
Upstash/KV variables are absent and fails open when the store errors. This is a
documented availability tradeoff, not an implementation bug.

**Impact:** A missing or broken production Redis integration effectively
removes reliable distributed throttling from `/api/contact`.

**Remediation:** Validate required rate-limit variables during production
deployment, add monitoring for store failures, and consider a Vercel Firewall
rule. Decide explicitly whether production should fail open or closed.

### TD-051 — Inquiry retries can duplicate rows after a Resend miss

**Severity:** Medium  
**Area:** Reliability / Contact form

`POST /api/contact` now returns 200 if the `inquiries` insert succeeded even
when Resend fails, so the visitor is not told to retry solely because email
delivery missed. There is still no `emailed_at` column and no reuse of a
recent row for the same email + description. A client timeout, refresh, or
later “try again” still inserts another row. Table Editor also cannot show
whether the notification email went out.

**Impact:** Duplicate leads during Resend incidents; operators cannot tell a
stored inquiry from a notified one without checking the inbox.

**Remediation:** Add `emailed_at timestamptz` (null until send succeeds) and
set it after a successful Resend call. If retries must re-send mail, look up
a recent matching row instead of inserting again. Recorded from MDI-118
review; out of scope for the persist dual-write change.

### TD-012 — Testimonials behavior is complex and has interaction edge cases

**Severity:** Medium  
**Area:** Accessibility / Maintainability

`components/testimonials-rotator.tsx` is roughly 300 lines and coordinates
eight refs, multiple pause reasons, two timers, hover, focus, touch, and reduced
motion. Specific issues:

- The `.testimonial-pause` branch at lines 69-83 has no matching class in the
  rendered markup.
- Hover listeners are attached to the inner grid at lines 254-257, not the
  whole card padding.
- Entering while the 400 ms fade is already running does not cancel that fade,
  so the quote can still change after the pointer arrives.
- Touch toggles a persistent pause with no visible paused state or explicit
  Pause/Play control.

**Impact:** Small changes are regression-prone, and the automatic movement is
not clearly controllable for touch or assistive-technology users.

**Remediation:** Add an explicit Pause/Play control, move pause behavior to the
whole region, cancel in-progress transitions on interaction, and extract/test
focused hooks for reduced motion, pause reasons, and rotation timing.

### TD-013 — Calendar booking has no failure fallback

**Severity:** Medium  
**Area:** Conversion reliability

`components/calendar-modal.tsx:143-149` relies entirely on a third-party Google
Calendar iframe. There is no load timeout, error state, or direct “Open Google
Calendar” link.

**Impact:** Embed policy, network, privacy extensions, or Google errors can
leave a blank modal at the primary conversion point.

**Remediation:** Always provide a direct external link, add a loading/failure
state, and consider making the external schedule the primary fallback.

### TD-014 — Calendar modal motion and mobile close affordance need refinement

**Severity:** Medium  
**Area:** Accessibility / Mobile UX

The modal animation at `components/calendar-modal.tsx:123-127` does not disable
transition/transform for reduced-motion users. The close control at lines
133-141 is positioned above the mobile sheet and does not guarantee a 44×44 px
target.

**Impact:** Motion preferences are not fully respected, and closing can be
harder on a touch device.

**Remediation:** Add reduced-motion variants and place a clearly visible,
minimum-size close button inside the modal chrome.

### TD-015 — Analytics strategy and consent behavior are not explicit

**Severity:** Medium  
**Area:** Analytics / Privacy

`app/layout.tsx:92-94` loads both custom GA4 and Vercel Analytics. GA4 loads
whenever a measurement ID exists (`components/analytics.tsx`) without a consent
state. The privacy policy describes cookies generally but there is no consent
implementation. `lib/analytics.ts` tracks only pathname identity and queues
events at module scope. That `pendingEvents` array is unbounded: if `gtag`
never becomes available, every click and page view keeps accumulating in
memory.

**Impact:** Two analytics systems create overlapping operational ownership.
Depending on visitor jurisdiction and GA configuration, unconditional GA4 may
create compliance risk. Query-only navigation and attribution behavior are not
fully tested.

**Remediation:** Document why both systems exist and which metrics each owns,
confirm legal consent requirements, implement consent mode/banner if required,
and test attribution across client navigation and query-string changes.

### TD-016 — No application security-header policy

**Severity:** Medium  
**Area:** Security hardening

`next.config.mjs` defines redirects but no response headers. There is no
documented Content Security Policy, Referrer Policy, Permissions Policy, or
`X-Content-Type-Options` strategy. A CSP must account for Google Calendar,
Google Analytics, Vercel Analytics, inline JSON-LD, and font/image sources.

**Impact:** The site relies on browser and platform defaults and has no explicit
defense-in-depth boundary around third-party scripts and frames.

**Remediation:** Add and test a minimal header policy. Roll out CSP in
report-only mode first, then enforce it without breaking analytics or booking.

### TD-017 — Social and favicon assets are oversized or misdeclared

**Severity:** Medium  
**Area:** Performance / Social previews

`public/assets/images/giorgi.jpg` is about 900 KB and 2241×2389, but
`lib/metadata.ts:4-9` declares it as 1024×1024. The favicon is about 248 KB and
1280×1433 although metadata advertises it as 32×32.

**Impact:** Crawlers receive incorrect social-image dimensions, previews may
crop unpredictably, and every page can transfer an unnecessarily large
favicon.

**Remediation:** Produce dedicated, correctly declared social artwork
(typically 1200×630) and real 16/32/48 px favicon assets. Keep the source
portrait separate from delivery assets.

### TD-018 — Permanent visual effects should be profiled

**Severity:** Medium pending measurement  
**Area:** Performance / Core Web Vitals

`components/gradient-background.tsx` runs a filtered SVG/blurred animation on
desktop. `app/globals.css:138-142` permanently promotes three animated blobs
with `will-change`; the fixed header also uses backdrop blur.

**Impact:** These effects can consume compositor memory and increase paint/GPU
work on lower-end desktops. The background is correctly hidden on mobile and
respects reduced motion, which reduces the risk.

**Remediation:** Measure with Lighthouse and browser Performance tools before
changing behavior. If costly, remove persistent `will-change`, reduce blur, or
serve a static fallback for constrained devices.

### TD-019 — `SelectedWork` content has two schema variants

**Severity:** Medium  
**Area:** Data model / Maintainability

`lib/content.ts:77-91` makes `tagline`, `challenges`, and `achievements`
optional while retaining required singular `challenge` and `outcome` fields.
METIS and Flighter use arrays; older entries use singular strings.
`app/work/page.tsx:55-82` branches labels and rendering around both shapes.

**Impact:** Every case study author must choose and maintain one of two models,
and presentation logic grows with content variation.

**Remediation:** Normalize all case studies to arrays (even one-item arrays),
remove redundant singular fields, and validate content with a schema or focused
tests.

### TD-020 — Page wrapper may clip intended overflow

**Severity:** Medium  
**Area:** Layout / Focus visibility

`app/layout.tsx:83` places `overflow-hidden` on all page chrome. The Toptal
badge intentionally extends beyond its card (`app/globals.css:150-159`), and
focus rings or other positioned elements near page edges can also be clipped.

**Impact:** Decorative UI and accessibility indicators can disappear at narrow
boundaries.

**Remediation:** Scope overflow clipping only to the decorative background or
specific sections that require it.

### TD-021 — No skip link for the fixed global navigation

**Severity:** Medium  
**Area:** Accessibility

`app/layout.tsx` renders the fixed header immediately before `<main>` with no
“Skip to main content” link.

**Impact:** Keyboard users must traverse the global navigation on every page.

**Remediation:** Add a focus-visible skip link and a stable ID/focus target on
`main`.

### TD-042 — Sentry tunnel `/monitoring` has no rate limit

**Severity:** Medium  
**Area:** Reliability / Abuse prevention

`next.config.mjs` sets `tunnelRoute: "/monitoring"` so browser events can
bypass ad blockers. The public DSN already allows quota burn; the extra cost
unique to the tunnel is unauthenticated Vercel invocations with no application
rate limit (unlike `POST /api/contact`).

**Impact:** A client can generate function invocations (and Sentry ingest
volume) without going through the contact-form limiter.

**Remediation:** Add a Vercel Firewall / rate-limit rule for `/monitoring`, or
drop the tunnel if ad-block bypass is not required.

### TD-044 — `migrate_supabase` may need a database password on GitLab runners

**Severity:** Medium  
**Area:** Delivery / Supabase

`migrate_supabase` authenticates with `SUPABASE_ACCESS_TOKEN` and links by
`SUPABASE_PROJECT_REF` only. CLI 2.116 can mint a `cli_login_postgres` role
from the access token. GitLab shared runners have previously failed that
path with SASL / IPv6 `db.<ref>.supabase.co` connection errors.

**Impact:** A green lint/test/build pipeline can still block production
deploy when `db push` cannot reach the hosted database.

**Remediation:** If the first default-branch apply fails on auth or dial,
add a protected, masked `SUPABASE_DB_PASSWORD` and pass it to
`supabase link` / `db push` (`-p`). Keep the token; the password is the
CLI fallback, not a replacement.

### TD-045 — Rewriting an already-applied migration breaks `db push`

**Severity:** Medium  
**Area:** Delivery / Supabase

`supabase db push` checksums files already recorded in
`supabase_migrations.schema_migrations`. Editing
`20260903165746_create_blog_posts.sql` after it has been applied (for
example the !26 CHECK tighten) makes CI fail with a checksum mismatch and
blocks `deploy_production`.

**Impact:** Schema review follow-ups that edit an applied file cannot ship
through the default-branch pipeline until history is repaired.

**Remediation:** Never rewrite an applied migration. Add a follow-up
`ALTER` migration, or `supabase migration repair` only when the remote
history is known to be wrong.

**Finding (2026-09-04):** `next build` against the hosted `SUPABASE_URL`
returned `PGRST205 — Could not find the table 'public.blog_posts' in the
schema cache`. The table does not exist on that project, so the first
version of the file was never applied and the in-place rewrite carries no
checksum risk. Note that `PGRST205` proves the table is not exposed through
PostgREST rather than reading `supabase_migrations.schema_migrations`
directly; confirm against the migration history before relying on it.

### TD-043 — Calendar modal can close itself under React Strict Mode

**Severity:** Medium  
**Area:** Conversion reliability

`components/calendar-modal.tsx:16-108` opens the dialog in an effect and
closes it in the effect cleanup. The dialog `onClose` handler at lines
117-121 calls `closeCalendar()` whenever `isOpen` is still true. React
Strict Mode (and any future remount) runs that cleanup immediately, so
opening the calendar can dismiss it before the iframe appears.

**Impact:** Local `yarn dev` and any remount can make the primary conversion
modal flash open then close.

**Remediation:** Distinguish user-initiated `dialog.close()` from effect
cleanup, or stop calling `closeCalendar()` from `onClose` when the effect is
tearing down. Cover open/close with a focused test.

## Low priority

### TD-049 — `BlogPostRow` is hand-maintained against the migration

**Severity:** Low  
**Area:** Blog / Type safety

`lib/blog.ts` declares the `public.blog_posts` row shape by hand, and `toPost`
/ `toRow` map it to the camelCase `BlogPost`. Nothing ties that type to
`supabase/migrations/`, and the Supabase client is untyped, so `select()`
results are cast rather than checked.

**Impact:** Adding or renaming a column without editing the type is a silent
runtime mismatch — an undefined field reaching a page — rather than a compile
error.

**Remediation:** Generate types with `supabase gen types typescript` into a
checked-in file and parameterize the clients with the generated `Database`
type. Wait until the table exists on the hosted project (TD-044, TD-045).

### TD-050 — MCP host allowlist excludes Vercel preview URLs

**Severity:** Low  
**Area:** Blog / MCP

`mcp/src/config.ts` allowlists `localhost` / `127.0.0.1` / `::1` and
`mdivani.agency` / `www.mdivani.agency`. A `BLOG_API_BASE_URL` pointing at a
Vercel preview (`*.vercel.app`) is rejected so a mistyped or redirected
origin cannot receive `BLOG_WRITE_TOKEN`.

**Impact:** An agent that should write to a preview deployment has to retarget
localhost or production. Preview-host writes are not a supported path today.

**Remediation:** If preview publishing becomes a real workflow, add an explicit
allowlist of known Vercel hostnames (not a `*.vercel.app` wildcard) and keep
`redirect: "error"` on the token-bearing fetch.

### TD-052 — `inquiries` has no CHECK integrity floor

**Severity:** Low  
**Area:** Contact form / Schema

`public.inquiries` stores `project_type`, `timeline`, `budget`, and the
free-text fields as unconstrained `text`. `blog_posts` encodes an integrity
floor with CHECK constraints. The validated `POST /api/contact` path is the
only writer today, so this is not an access-control hole, but a Table Editor
edit or a later second writer can store values `validateContactPayload`
would reject (empty `project_type`, overlong description).

**Impact:** Filtering by the form enums silently misses dashboard-edited
rows. Hardcoding `PROJECT_TYPES` / `BUDGETS` / `TIMELINES` in SQL will drift
the next time the form options change (MDI-95 already dropped `< $10k`).

**Remediation:** Add CHECKs that match `lib/contact.ts` (enum membership plus
`char_length` bounds), or generate them from the same source. If the table
already exists, use the idempotent `DO $$ ... pg_constraint ...` pattern —
Postgres has no `ADD CONSTRAINT IF NOT EXISTS`. Recorded from MDI-118
review; left out of that migration so form option changes do not require a
schema deploy.

### TD-053 — CODEOWNERS does not enforce a second reviewer

**Severity:** Low  
**Area:** Delivery / Access control

`.github/CODEOWNERS` covers `.github/` so workflow edits that remap
`${{ secrets.* }}` get a named owner. GitHub ignores owners without write
access, so `@mdivani` was dropped. The remaining owner is
`@mdivanigiorgi`. CODEOWNERS does not block merges unless `development`
requires a review from Code Owners, and an author-only approval still
lands if that owner is also the last pusher.

**Impact:** A write-access PR can change CI to print environment secrets
without an independent review.

**Remediation:** In GitHub branch protection for `development`, require a
review from Code Owners and a review from someone other than the last
pusher. Add a second write-access CODEOWNER if one exists. Creating the
`supabase` and `production` Environments (deployment branch `development`
only) is a separate dashboard prerequisite, not this item.

Recorded from the GitHub Actions cutover re-review; left out of that PR
because it is repository settings, not workflow YAML.

### TD-054 — `blog_posts_slug_check` still allows reserved slug `page`

**Severity:** Low  
**Area:** Blog / Schema

`validateBlogWritePayload` and the MCP Zod slug fields reject `page` so it
cannot collide with `/blog/page/[page]`. `public.blog_posts` CHECK
`blog_posts_slug_check` only enforces the hyphenated pattern and length, so a
Table Editor or SQL insert can still store `page`. A published row would 404
at `/blog/page` because the static `page` segment wins over `[slug]`.

**Impact:** Dashboard or SQL writers can create an unreachable public post.

**Remediation:** Add a follow-up `ALTER` migration that excludes reserved
slugs, ideally from the same `RESERVED_SLUGS` list as `lib/blog-schema.ts`.
Do not rewrite `20260903165746_create_blog_posts.sql` (TD-045).

Recorded from MDI-140 review; left out of that PR because product writes
already reject the slug and a schema deploy is a separate migration.

### TD-022 — Duplicated SVG sources and unused assets remain

**Severity:** Low  
**Area:** Repository hygiene

- `components/svg/socials/*.svg` duplicates paths already in
  `components/icons.tsx` and is not imported.
- Only the favicon, logo, and Giorgi portrait are referenced from the tracked
  `public/assets` set; numerous migration-era images remain.

Unreferenced public assets do not increase browser transfer unless requested,
but they add repository and deployment noise. The unused `Geography` and
`SelectedWork` sections were removed.

**Remediation:** Confirm no external URL depends on each public asset, then
delete unused files.

### TD-024 — Compiler incremental output is tracked

**Severity:** Low  
**Area:** Git hygiene

`tsconfig.tsbuildinfo` is tracked, while `.gitignore` does not ignore
`*.tsbuildinfo`. Running type-check or build modifies it. `.DS_Store` is also
tracked and not ignored.

**Partially addressed (2026-09-04):** the `.gitignore` entry read
`.tsconfig.tsbuildinfo` with a leading dot, which never matches the real
`tsconfig.tsbuildinfo` — the rule looked present but had no effect. Corrected
to `*.tsbuildinfo`.

Still outstanding: an ignore rule does not untrack an already-tracked file, so
`git rm --cached tsconfig.tsbuildinfo` is still required, and `.DS_Store` is
neither ignored nor untracked.

**Impact:** Routine validation and Finder metadata produce noisy working-tree
changes and merge conflicts.

**Remediation:** Ignore `*.tsbuildinfo` and `.DS_Store`, then remove both from
the Git index.

### TD-025 — Styling contains silent and duplicated conventions

**Severity:** Low  
**Area:** CSS / Design system

- `font-regular` is used in `components/footer.tsx` and
  `components/mail-link.tsx`, but Tailwind does not define that utility; the
  intended weight is silently absent.
- `leading-[1.55]` and long arbitrary color/effect values are repeated across
  components despite an otherwise tokenized Tailwind theme.
- Legal components duplicate the same long descendant-selector class string.

**Remediation:** Replace `font-regular` with `font-normal`, add semantic
typography/effect tokens only where repetition justifies them, and extract a
shared legal-document wrapper.

### TD-026 — Sitemap modification dates are synthetic

**Severity:** Low  
**Area:** SEO

Every entry in `app/sitemap.ts` uses `new Date()`, so every deployment claims
that every page changed.

**Impact:** `lastModified` becomes a noisy, low-trust signal.

**Remediation:** Use actual content/git dates, maintain explicit dates with the
content, or omit `lastModified` until accurate values are available.

### TD-027 — Brand and legal naming are inconsistent

**Severity:** Low, pending legal clarification  
**Area:** Content maintenance

`lib/site.ts` uses “Mdivani Agency,” while legal pages and `package.json` use
“Mdio” or “Mdio (Mdivani Agency).”

**Impact:** Copy and legal identity can drift.

**Remediation:** Establish the public brand name and legal entity name as
separate centralized values, then render them consistently.

### TD-028 — Process stage labels have two sources

**Severity:** Low  
**Area:** Content modeling

`lib/content.ts` defines `processSteps`, while
`components/sections/greenfield.tsx:6-12` repeats the stage labels locally.

**Impact:** The two sequences can drift.

**Remediation:** Derive the compact label-only sequence from `processSteps`.

### TD-029 — Small list keys depend on mutable copy

**Severity:** Low  
**Area:** React maintenance

`app/work/page.tsx` keys challenges and achievements by full sentence;
`components/testimonials-rotator.tsx` keys paragraphs by paragraph text.

**Impact:** Duplicate or edited copy can cause unstable/duplicate keys.

**Remediation:** Add stable IDs to structured content or combine a stable parent
ID with the item index.

### TD-030 — Browserslist data is stale

**Severity:** Low  
**Area:** Build tooling

The production build warns that `caniuse-lite` data is 19 months old.

**Impact:** Generated browser targeting and prefix decisions use stale
compatibility data.

**Remediation:** Update Browserslist data as part of a reviewed dependency
maintenance change and schedule periodic lockfile refreshes.

### TD-031 — Some interactive targets are smaller than recommended

**Severity:** Low  
**Area:** Mobile accessibility

The testimonial LinkedIn link uses `min-h-3 min-w-3` (24×24 px with this
project's spacing scale), and the small conversation button is 40 px tall.

**Impact:** Targets fall below the commonly recommended 44×44 CSS pixel touch
area.

**Remediation:** Increase invisible padding/hit area without necessarily
enlarging the visual icon.

### TD-032 — Viewport-height layouts use legacy `vh` units on mobile

**Severity:** Low  
**Area:** Responsive layout

`components/sections/hero.tsx:10` uses a `100vh` calculation, while
`components/header.tsx:107` and `components/calendar-modal.tsx:114-125` use
`h-screen`/`vh` sizing for full-screen mobile surfaces.

**Impact:** Expanding and collapsing mobile browser chrome can produce layout
jumps, clipped content, or extra space.

**Remediation:** Prefer `dvh`/`svh` utilities with an appropriate `vh` fallback,
then verify iOS Safari and Android Chrome in both orientations.

### TD-033 — Navigation does not expose current-page state

**Severity:** Low  
**Area:** Accessibility / Navigation

The desktop and mobile links in `components/header.tsx:60-68,137-147` never set
`aria-current="page"`. The menu trigger label also remains “Open navigation”
regardless of `aria-expanded`.

**Impact:** Assistive-technology users receive less context about their current
location and the menu control's state.

**Remediation:** Compare links with `usePathname()`, set `aria-current="page"`
for the active route, and make the trigger label state-aware.

### TD-034 — Legal body typography is unnecessarily fragile

**Severity:** Low  
**Area:** Readability

Both legal document wrappers use `font-thin`
(`components/legal/privacy-policy.tsx:5` and
`components/legal/terms-of-service.tsx:5`).

**Impact:** Weight 100 can be difficult to read in long-form text, especially
on low-density displays.

**Remediation:** Use `font-normal` for legal body copy and reserve thin weights
for nonessential decorative text.

### TD-035 — Mail icon color bypasses the design tokens

**Severity:** Low  
**Area:** Styling / Accessibility

`components/mail-link.tsx:14-23` hardcodes both SVG strokes to `#FFF9F9`
instead of inheriting the link color.

**Impact:** The icon will not follow theme, hover, or future contrast changes.

**Remediation:** Use `stroke="currentColor"` and control color on the link.

### TD-036 — Migration-era package and analytics naming remains

**Severity:** Low  
**Area:** Configuration / Documentation

`package.json` still describes the project as “Get info about mdio and contact
us.” `components/analytics.tsx:12-15` and `.env.example` support both the
canonical GA variable and the legacy
`NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` alias after the Firebase hosting cutover.

**Impact:** New contributors and deployment configuration have two names for
one analytics setting and stale project positioning.

**Remediation:** Update package metadata and deprecate the Firebase alias after
confirming no active environment relies on it.

### TD-037 — No branded not-found experience

**Severity:** Low  
**Area:** UX

There is no `app/not-found.tsx`; the application uses Next.js's generic 404
page.

**Impact:** Mistyped URLs lose the site's navigation, tone, and conversion
path. Retired marketing URLs now redirect, so this mainly affects unknown
paths.

**Remediation:** Add a small branded not-found page linking to the homepage,
selected work, and How I Work.

### TD-038 — Ordered-list semantics rely on browser behavior

**Severity:** Low  
**Area:** Accessibility compatibility

`components/stage-list.tsx` renders an `<ol>` with `list-none`. Some
browser/screen-reader combinations, notably Safari with VoiceOver, may not
announce list semantics when list styling is removed.

**Impact:** Process steps may be read as unrelated cards rather than an ordered
sequence.

**Remediation:** Add `role="list"` to preserve cross-browser semantics, and
retain the existing visual numbering.

### TD-039 — CI does not run typecheck or a dependency audit

**Severity:** Medium  
**Area:** Delivery

`.gitlab-ci.yml` runs lint, test, and build on Node 22. It does not run a
standalone `tsc --noEmit` or `yarn npm audit`. `README.md` documents
`dev`/`build`/`start`/`lint` only and omits `test` and the GitLab pipeline.

**Impact:** Type errors that slip past ESLint, and known build-time
vulnerabilities, will not fail a merge. Contributors may miss how to run the
suite locally.

**Remediation:** Add a typecheck script and CI job, add a production audit job
(and optionally a scheduled full audit), and document `yarn test` plus CI in
the README.

### TD-040 — Tests fail unless the local Node version is 22

**Severity:** Low  
**Area:** Tooling

`package.json` pins `engines.node` to `22.x` and CI uses `node:22`, but
`engineStrict` is unset. Vitest 4 / Vite 8 fail to start on Node 21
(`ERR_INVALID_ARG_VALUE` in Rolldown `styleText`).

**Impact:** A developer on Node 21 cannot run tests even after an immutable
install.

**Remediation:** Enable `engineStrict` or add a pre-test Node version check.
Keep the README requirement visible next to the test script.

### TD-041 — Two capability cards link to the same page

**Severity:** Low  
**Area:** Information architecture

`lib/content.ts` now points both AI Engineering and Product Engineering at
`/how-i-work`. Those routes exist, so this is not a 404.

**Impact:** Homepage cards have weaker destination scent; both “Explore”
links land on the same page.

**Remediation:** Link to distinct in-page anchors on `/how-i-work`, or accept
the overlap as intentional.

## Decisions to confirm

These are not automatically defects:

1. **Dual analytics:** confirm whether Vercel Analytics is for operational
   telemetry and GA4 for marketing attribution.
2. **Rate-limit fail-open:** confirm that inquiry availability is intentionally
   prioritized over abuse protection during Redis outages.
3. **“Mdio” naming:** confirm whether it is a legal entity name rather than
   stale branding.

## Recommended remediation order

1. Fix remaining route-level accessibility: mobile navigation, hidden header,
   and skip link (TD-004, TD-005, TD-021).
2. Finish route-integrity coverage for redirects and generated `app/` pages
   (remaining TD-009). Add CI typecheck and audit jobs (TD-039).
3. Verify production rate-limit configuration (TD-011), add a Firewall
   rule for the Sentry tunnel (TD-042), require code-owner reviews on
   `development` (TD-053), and confirm the first
   `migrate_supabase` apply (TD-044, TD-045). Set `BLOG_WRITE_TOKEN` on
   Vercel only once that apply succeeds. Inquiry `emailed_at` / retry
   dedupe is TD-051. Reserved-slug CHECK `page` is TD-054.
4. Simplify and harden testimonial and calendar interactions (TD-012–TD-014,
   TD-043).
5. Decide analytics/consent and add security headers (TD-015, TD-016).
6. Optimize delivery assets and profile visual effects (TD-017, TD-018).
7. Normalize content models and remove dead/generated repository artifacts
   (TD-019, TD-022, TD-024–TD-041). Generate the Supabase row types once the
   table exists (TD-049).
