# Technical Debt Register

Last audited: 2026-08-31

This is a point-in-time static audit of the Next.js application, supporting
configuration, tests, and deployment documentation. It prioritizes observable
user impact, accessibility, search indexing, security, and maintenance cost.

## Validation snapshot

- `yarn install --immutable`: passes, with peer-dependency warnings.
- `yarn lint`: passes.
- `yarn tsc --noEmit`: passes.
- `yarn test` on the required Node.js 22 runtime: 14 files and 100 tests pass.
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

## High priority

### TD-001 — Capability cards link to routes that do not exist

**Severity:** High  
**Area:** Routing / UX / SEO

`lib/content.ts:4` links AI Engineering to `/ai-engineering`, and
`lib/content.ts:22` links Product Engineering to `/product-development`.
`components/sections/what-i-build.tsx:34-36` renders both links, but neither
route exists under `app/`, and `next.config.mjs` does not redirect them.

**Impact:** Visitors and crawlers reach 404 pages from prominent homepage
cards.

**Remediation:** Add the intended pages, retarget the cards to existing routes,
or add permanent redirects. Add a route-integrity test so internal content
links cannot point to missing pages.

### TD-002 — Sitemap is out of sync with actual routes

**Severity:** High  
**Area:** SEO / Routing

`app/sitemap.ts:9-18` publishes the nonexistent `/ai-engineering` and
`/product-development` routes. It omits the live `/how-i-work` route referenced
by `lib/site.ts:22`.

**Impact:** Search engines are directed to 404 pages and are not explicitly
given one of the primary navigation pages.

**Remediation:** Correct the immediate entries, then generate navigation and
sitemap entries from one typed route registry. Test each sitemap URL against
the application route set.

### TD-003 — The About page has no page-level heading

**Severity:** High  
**Area:** Accessibility / SEO

`app/about/page.tsx` renders `AboutGiorgi`, whose heading is produced by
`SectionHeader` as an `<h2>` (`components/section-header.tsx:9-13`). There is no
`<h1>` on `/about`.

**Impact:** The document outline starts at level two, weakening navigation for
screen-reader users and the page's primary search signal.

**Remediation:** Add `PageIntro` to `/about`, allow `AboutGiorgi` to select its
heading level, or render its route-level title as `<h1>`.

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

### TD-006 — `/how-i-work` contains stale migration code and a broken landmark

**Severity:** Medium  
**Area:** Accessibility / Maintainability

`app/how-i-work/page.tsx:3,9` retains an unused `capabilities` import and
`capability` variable. The exported function is still named
`AiEngineeringPage`. The wrapper at `app/how-i-work/page.tsx:26` uses
`aria-labelledby="ai-how-heading"`, but that ID does not exist; its children
already render their own named sections.

**Impact:** The outer section is an unnamed landmark, and stale names obscure
the route's current purpose.

**Remediation:** Replace the outer `Section` with a non-landmark layout wrapper,
remove the dead variable/import, and rename the page component.

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

### TD-008 — No repository CI enforces the existing quality gates

**Severity:** Medium  
**Area:** Delivery

The repository has lint, build, and test scripts in `package.json`, and 100
tests currently pass, but there is no GitLab CI file or other repository
workflow.

**Impact:** A branch can be merged without running lint, tests, route checks, or
the production build. Vercel build output alone does not cover all checks.

**Remediation:** Add GitLab CI on Node.js 22 with immutable install, lint,
type-check, tests, production build, and production dependency audit.

### TD-009 — Route and sitemap integrity are not covered by tests

**Severity:** Medium  
**Area:** Testing

`lib/__tests__/content.test.ts` checks that capability URLs start with `/`, but
does not verify that they resolve. There is no sitemap test. The current suite
therefore passes with TD-001 and TD-002 present.

**Impact:** Broken internal routes and search-index regressions can pass all
automated checks.

**Remediation:** Maintain a typed route registry and test content links,
navigation links, redirects, sitemap entries, and generated routes against it.

### TD-010 — Contact backend has no user-facing form

**Severity:** Medium, pending product decision  
**Area:** Incomplete feature / Maintenance

`app/api/contact/route.ts`, `lib/contact.ts`, `lib/rate-limit.ts`, Resend, and
their environment variables and tests implement a substantial contact backend.
No contact form component calls `/api/contact`, while `/contact` permanently
redirects to `/`.

**Impact:** The project maintains server code, credentials, rate limiting, and
tests for functionality visitors cannot use.

**Remediation:** If the form is in progress, track and finish the frontend and
its accessible error/success behavior. Otherwise remove the dormant API and
dependencies until there is a committed product need.

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
events at module scope.

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

## Low priority

### TD-022 — Dead components, duplicated SVG sources, and unused assets remain

**Severity:** Low  
**Area:** Repository hygiene

- `components/sections/geography.tsx` and
  `components/sections/selected-work.tsx` are not imported.
- `components/svg/socials/*.svg` duplicates paths already in
  `components/icons.tsx` and is not imported.
- Only the favicon, logo, and Giorgi portrait are referenced from the tracked
  `public/assets` set; numerous migration-era images remain.

Unreferenced public assets do not increase browser transfer unless requested,
but they add repository and deployment noise.

**Remediation:** Confirm no external URL depends on each public asset, then
delete unused files or restore the intended sections.

### TD-023 — `lucide-react` is declared but unused

**Severity:** Low  
**Area:** Dependencies

`package.json` includes `lucide-react`, but there are no imports; the project
uses local SVG components instead.

**Remediation:** Remove the dependency or deliberately standardize generic UI
icons on it.

### TD-024 — Compiler incremental output is tracked

**Severity:** Low  
**Area:** Git hygiene

`tsconfig.tsbuildinfo` is tracked, while `.gitignore` does not ignore
`*.tsbuildinfo`. Running type-check or build modifies it.

**Impact:** Routine validation produces noisy working-tree changes and merge
conflicts.

**Remediation:** Ignore `*.tsbuildinfo` and remove the file from the Git index.

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

**Impact:** Mistyped or retired URLs lose the site's navigation, tone, and
conversion path. This is more visible while TD-001 remains unresolved.

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

## Decisions to confirm

These are not automatically defects:

1. **Contact API:** confirm whether the form UI is actively in progress before
   removing any backend code.
2. **Dual analytics:** confirm whether Vercel Analytics is for operational
   telemetry and GA4 for marketing attribution.
3. **Rate-limit fail-open:** confirm that inquiry availability is intentionally
   prioritized over abuse protection during Redis outages.
4. **Unused Selected Work and Geography sections:** confirm whether they are
   intentionally staged for later homepage use.
5. **“Mdio” naming:** confirm whether it is a legal entity name rather than
   stale branding.

## Recommended remediation order

1. Fix capability links and synchronize the sitemap (TD-001, TD-002).
2. Fix route-level accessibility: About heading, mobile navigation, hidden
   header, How I Work landmark, and skip link (TD-003–TD-006, TD-021).
3. Add route-integrity tests and CI enforcement (TD-008, TD-009).
4. Decide and finish/remove the contact frontend; verify production rate-limit
   configuration (TD-010, TD-011).
5. Simplify and harden testimonial and calendar interactions (TD-012–TD-014).
6. Decide analytics/consent and add security headers (TD-015, TD-016).
7. Optimize delivery assets and profile visual effects (TD-017, TD-018).
8. Normalize content models and remove dead/generated repository artifacts
   (TD-019, TD-022–TD-038).
