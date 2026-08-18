# Architecture — c.a.f.a Atelier 央艺

Companion to `CLAUDE.md`. That file is the law; this is the map.

---

## 1. Stack decisions and why

| Decision | Choice | Reason |
|---|---|---|
| Framework | Next.js App Router, `output: 'export'` | Every route becomes real HTML at build time. A crawler and a cold visitor both get the works index without waiting on a bundle. File-based routing + `generateStaticParams` means new works generate pages with no code change. |
| Styling | CSS Modules + custom properties | Zero runtime, scoped by default, and tokens are the single source of truth. Tailwind would put design decisions back into JSX as literals — the exact thing §4 of the constitution forbids. |
| Animation | Browser-native: view transitions + scroll-driven animations | The budget for `motion` was ~5 KB and it has not been spent. React's `<ViewTransition>` hands route changes to the browser's View Transitions API, and `animation-timeline: view()` binds scroll motion to the compositor. Both are CSS from that point on, so the most animated surface on the site ships no animation runtime at all. §5.4–5.5. |
| Content | Fetched from CAFA-Admin (D1) at build time | `scripts/fetch-content.mjs` calls `src/services/content-api.mts` and writes `content/bundle.generated.json` before `next build`; `lib/content-schema.ts` re-parses every field, so a malformed record fails the build instead of rendering. No runtime fetch, no CMS client, no server. The studio edits in the admin and presses Publish; a deploy hook rebuilds this. |
| i18n | Route segment + dictionary | Two locales don't justify a library. `[locale]` segment, a `dictionaries/` map, `generateStaticParams` emits both trees. |
| Images | R2 originals, transformed on delivery | `next/image` optimisation is unavailable under `output: 'export'`, and a build-time `sharp` pass cannot survive CI — its incremental cache dies with the container, so every build would re-encode ~700 AVIF derivatives. Cloudflare transforms the original per request and caches it; `format=auto` negotiates AVIF or WebP. Nothing is derived at build time and no media ships in `out/`. |
| Deploy | Cloudflare Workers, static assets | `out/` is the whole artefact — HTML, CSS and JS, no media. Builds are triggered by a deploy hook the admin pokes on publish. |

**The `next/image` caveat, handled.** `next.config.ts` sets `images: { unoptimized: true }`.
We never use `next/image`. `components/primitives/MediaFrame.tsx` renders a `<picture>` from
the dimensions in the content bundle and the transform URLs `lib/media.ts` builds. This is
the one place in the codebase that touches image markup.

---

## 2. File tree

```
.
├── CLAUDE.md
├── README.md
├── docs/
│   ├── Architecture.md              # this file
│   ├── DESIGN-SYSTEM.md
│   └── MOTION.md
├── next.config.ts
├── wrangler.jsonc                   # static-only Worker: no `main`, no runtime
├── tsconfig.json                    # strict, paths: "@/*" → "src/*"
├── scripts/                         # thin CLI entries over src/services — env, disk, exit code
│   ├── fetch-content.mjs            # CAFA-Admin → src/content/bundle.generated.json
│   ├── emit-404.mjs                 # out/not-found/ → out/404.html
│   └── emit-build-info.mjs          # out/build-info.json — the revision this build used
├── public/
│   ├── _headers                     # a year of immutable caching for chunks and fonts
│   └── fonts/                       # subset woff2
└── src/
    ├── services/                    # the CAFA-Admin contract. Build time only, under Node.
    │   ├── content-api.mts          # what the build reads: { revision, bundle }
    │   └── build-info.mts           # what the build answers back: which revision is live
    ├── app/                         # NOTE: no app/layout.tsx — see §4
    │   ├── (root)/
    │   │   ├── layout.tsx           # <html lang> for the two pages below
    │   │   ├── page.tsx             # `/` — static meta-refresh into the default locale
    │   │   └── not-found/page.tsx   # becomes out/404.html via scripts/emit-404.mjs
    │   ├── [locale]/
    │   │   ├── layout.tsx           # <html lang>, header + <main> + footer + the contact card
    │   │   ├── page.tsx             # home — SANAA-minimal
    │   │   ├── works/
    │   │   │   ├── page.tsx         # ium-style index
    │   │   │   └── [slug]/page.tsx  # ium-style detail
    │   │   ├── programs/page.tsx
    │   │   └── about/page.tsx       # …and no contact/ — see §4
    │   ├── robots.ts
    │   └── sitemap.ts
    ├── components/
    │   ├── primitives/
    │   │   ├── Media.tsx            # an ImageRef, resolved to its intrinsic dimensions
    │   │   ├── MediaFrame.tsx       # the only <picture>: srcset, intrinsic size, required alt
    │   │   ├── Text.tsx             # renders a token type-role as any element
    │   │   └── Grid.tsx             # the 12-col page grid
    │   ├── motion/
    │   │   ├── PageTransition.tsx   # React <ViewTransition> around every page
    │   │   ├── NavStage.tsx         # classifies a navigation, writes data-figure on <html>
    │   │   ├── ScrollField.tsx      # publishes scroll velocity and pointer position — §5.5
    │   │   ├── Focus.tsx            # the focus curve on media; what replaced Reveal
    │   │   ├── Parallax.tsx         # media drifts inside a clipped frame
    │   │   ├── Recede.tsx           # a block shrinks as it leaves the top
    │   │   ├── StickyColumn.tsx     # position:sticky wrapper with bounds
    │   │   ├── HoverMediaLayer.tsx  # ium full-bleed hover backdrop
    │   │   ├── PinnedNote.tsx       # the contact card, pinned over any page and draggable
    │   │   └── Part.ts              # a class, not a component: names a block for a figure
    │   ├── seo/
    │   │   └── JsonLd.tsx           # the only dangerouslySetInnerHTML in the codebase
    │   └── composites/
    │       ├── SiteHeader.tsx       # …and SiteFooter, LocaleSwitch, PageHeading
    │       ├── WorkIndex.tsx        # the list + its hover backdrop (a Client Component)
    │       ├── WorkIndexRow.tsx
    │       ├── WorkRail.tsx         # the index compressed to a column of numbers — §5.2
    │       ├── WorkMetaPanel.tsx    # sticky left column on detail
    │       ├── WorkPager.tsx        # previous / next, in editorial order
    │       ├── MediaSequence.tsx    # scrolling right column on detail
    │       ├── StudioSequence.tsx   # the home page below the fold, full bleed
    │       ├── StudioStrip.tsx      # the same photographs, sideways, on About
    │       ├── ProgramList.tsx
    │       ├── MentorGrid.tsx
    │       └── ContactBlock.tsx     # the card PinnedNote carries
    ├── content/
    │   └── bundle.generated.json    # fetched by prebuild; gitignored, never committed
    ├── lib/
    │   ├── content-schema.ts        # JSON → typed records, or a build failure
    │   ├── content.ts               # getSite, getWorks, getWorkListings … — typed, pure
    │   ├── routes.ts                # every path in the site, as functions
    │   ├── metadata.ts              # canonical + hreflang, built from a route function
    │   ├── json-ld.ts               # schema.org payloads, so no page knows a vocabulary
    │   ├── media.ts                 # R2 key + width → a transform URL
    │   ├── choreography.ts          # which trigger and effect each surface gets — §5.5
    │   ├── nav-intent.ts            # (from, to) → the figure a navigation performs
    │   ├── vt-names.ts              # the per-slug view-transition names
    │   ├── vt-uniqueness.ts         # dev-only assertion: one name, one element
    │   ├── css-duration.ts          # reads a duration token so no timer is a literal
    │   ├── class-names.ts           # cx() — a component's class joined with its caller's
    │   └── types.ts                 # Work, WorkListing, Program, Mentor, Dictionary …
    ├── types/
    │   └── react-canary.d.ts        # pulls in the <ViewTransition> declaration
    └── styles/
        ├── tokens.css
        ├── fonts.css                # @font-face + the metric-matched fallbacks
        ├── globals.css              # reset + base element styles only
        ├── motion/                  # every ::view-transition-* rule, one file per figure
        │   ├── index.css            # the only import; base first, then the figures
        │   ├── base.css   enter-work.css   exit-work.css   step-work.css
        │   ├── lateral.css   descend-ascend.css   locale.css   restore.css
        │   └── effects.css   triggers.css        # the §5.5 scene system
        └── *.module.css             # colocated next to their component instead
```

Around a hundred files, roughly half of them the stylesheet colocated with a component.
That is the target: not 12, not 200 — and `src/lib` in particular is thirteen files named
for what they do rather than one `utils.ts`.

`styles/motion/` is the one stylesheet tree that is not modules, and it has to be: the
view-transition pseudo-element tree hangs off `:root` rather than off any component, so a
scoped stylesheet cannot reach it and two files touching it would fight. It is split by
*figure* rather than kept as one file because forty-odd keyframe sets in one place are
unnavigable; `index.css` is the only thing imported, and it fixes the order. Components opt
in by carrying a `view-transition-name`; what that name then *does* is decided in one
place.

---

## 3. Content model

`src/lib/types.ts` — the contract everything else obeys.

```ts
export type Locale = 'zh' | 'en';

/** Every user-visible string in content/ is this shape. Never a bare string. */
export type LocalisedText = Record<Locale, string>;

export interface ImageRef {
  /** the R2 object key, e.g. "works/edible-house/01.jpg" */
  src: string;
  /** REQUIRED. Empty string only for decorative images, and that must be deliberate. */
  alt: LocalisedText | '';
}

export type WorkStatus = 'completed' | 'in-progress' | 'private';

export interface Work {
  slug: string;                 // URL segment, kebab-case, stable forever
  index: number;                // the ium-style running number shown in the list
  title: LocalisedText;
  status: WorkStatus;
  discipline: LocalisedText[];  // "Architecture", "Spatial Illustration"
  year: number;
  summary: LocalisedText;
  credits: { role: LocalisedText; name: LocalisedText }[];
  cover: ImageRef;              // hover backdrop in the index; leads the detail column;
                                // and the shared element carried between the two (§5.4)
  media: ImageRef[];            // the rest of the scrolling right column, in order
}
```

`SiteContent.studio` is a non-empty tuple rather than a single `ImageRef`: the home page
below the fold is a sequence, not a photograph. The type is
`readonly [ImageRef, ...ImageRef[]]` so "there is at least one" is checked at compile time
instead of asserted at the call site.

Rules:

- The `works` array in the bundle is the **only** registry, and its order is the editorial
  order — `position` in the database, moved with the arrows in the admin's works list.
  Adding a work touches nothing in this repository at all.
- Content is **fetched, not committed**, because the studio edits it in CAFA-Admin and the
  database is the source of truth. `bundle.generated.json` is gitignored: a checked-in copy
  is a second source of truth that goes stale, and CI must always take the published one.
  `lib/types.ts` is still the contract, and `lib/content-schema.ts` still enforces it —
  what changed is where the bytes come from, not what has to be true of them.
- A `private` work renders in the index as an unlinked row (dimmed, no hover image), exactly
  as ium does. This is data-driven — `WorkIndexRow` branches on `status`, and nothing else
  in the codebase knows the concept exists.
- `ImageRef` carries no dimensions. The admin measures them from the uploaded bytes and
  the bundle carries them; `lib/media.ts` hands the numbers to `Media`, so a content record
  cannot disagree with the file in the bucket and nobody has to type a pixel count.
- A **private** work publishes no photographs. The admin drops its cover and media when it
  builds a revision, and `parseWorks` drops them again on the way in — which is why an
  empty `src` is legal for exactly that case and nowhere else.
- `lib/content.ts` exports pure functions only: `getSite()`, `getWorks()`, `getWork(slug)`,
  `getPrograms()`, `getMentors()`, `getDictionary(locale)` and `requireLocale(param)`.
  Components never import from `content/` directly; pages do, through `lib/content`.

---

## 4. Routing and i18n

```
/                    → redirect (static) to /zh        via app/page.tsx
/zh                  → home, Chinese
/zh/works            /zh/works/[slug]    /zh/programs   /zh/about
/en                  → home, English
/en/works            …
```

There is no `/contact`. It was a page and is now a card pinned over whichever page you are
on — `components/motion/PinnedNote`, mounted once in the locale layout and opened by the
nav item. The reasoning is MOTION.md §5.5b; the consequence for this section is that a nav
item is no longer necessarily a route, which is why `SiteContent.nav` is a union of "has an
`href`" and "`opens` a panel" rather than a list of links with one special case in it.

- **Two root layouts, and no `app/layout.tsx`.** A root layout cannot read route params, so
  a single one would have to hardcode `<html lang>` — wrong on every page of the other
  locale, and `:lang(zh)` is what drives the CJK leading in `tokens.css`.
  `app/[locale]/layout.tsx` owns the localised tree; `app/(root)/layout.tsx` owns `/` and
  the 404 source.
- `app/[locale]/layout.tsx` exports
  `generateStaticParams: () => [{locale:'zh'}, {locale:'en'}]`, which covers every page
  nested under it.
- `app/[locale]/works/[slug]/page.tsx` exports `generateStaticParams` producing the cross
  product of locales × work slugs. Every detail page is pre-rendered.
- **No middleware** — it doesn't run under static export. Root `/` is a static page that
  renders a `<meta http-equiv="refresh">` plus a link. Keep it dumb.
- **The 404 is a route, not `app/not-found.tsx`.** That file sits above both root layouts,
  so Next wraps it in a bare `<html>` with no `lang` and no stylesheet. Instead
  `app/(root)/not-found/page.tsx` renders inside a real root layout and
  `scripts/emit-404.mjs` (`postbuild`) renames its output to `out/404.html` and deletes the
  directory. The segment cannot be called `404`: the exporter writes its own built-in error
  page over anything at that path.
- `lib/routes.ts` is the only place a path string exists, and — since contact stopped being
  one — the only place the destinations that are *not* paths exist either:
  ```ts
  export const routes = {
    home:    (l: Locale) => `/${l}`,
    works:   (l: Locale) => `/${l}/works`,
    work:    (l: Locale, slug: string) => `/${l}/works/${slug}`,
    programs:(l: Locale) => `/${l}/programs`,
    about:   (l: Locale) => `/${l}/about`,
  } as const;

  /** Popover ids. Two ends of one identity — the trigger's `popovertarget`
      and the panel's `id` — so they are written once, like a vt-name. */
  export const panels = { contact: 'contact-note' } as const;
  ```
- `LocaleSwitch` maps the current pathname to its counterpart by swapping the first
  segment. It never hardcodes destinations.
- The two dictionaries in the bundle are both read as `Dictionary` (lib/types), so a key
  present in one and missing from the other fails the build rather than the page. They are
  stored as one flat `copy` table keyed by dotted path, with a `zh` and an `en` column, so
  a missing translation is a blank column rather than an absent key.
- The **nav labels** live in that same copy table and are lifted into `site.nav` by the
  admin. The nav's *shape* — the order, and which route or panel each item points at — is
  code, because it is wired to `lib/routes.ts`. The words are not.

---

## 5. The three signature interactions

### 5.1 Works index — the ium hover backdrop

`WorkIndex` (client component, the only substantial one in the app).

- Renders a `<ul>` of `WorkIndexRow`. Each row: index number, title, discipline, status —
  a 4-column grid whose columns collapse to 2 under 768 px.
- A single `HoverMediaLayer` sits at `position: fixed; inset: 0; z-index: 0`, behind the
  list. It holds **one** `<img>` whose `src` swaps to the hovered row's cover.
  One element, not one per row.
- On hover: backdrop `opacity 0 → 1` and `scale(1.04) → scale(1)` over 500 ms; the list
  `<ul>` gets a class that drops its colour to a translucent token. Both are CSS
  transitions on a data attribute — no per-frame JS.
- Covers are preloaded on `pointerenter` of the list container (not on page load), and only
  when `navigator.connection?.saveData !== true`.
- **Touch behaviour, defined:** no hover layer. Rows become full-width cards with the cover
  shown inline at a 3:2 crop above the title. This is a CSS-only branch via
  `@media (hover: hover)`, not a JS device check.
- Keyboard parity: `:focus-within` on a row triggers the same backdrop as `:hover`.

### 5.2 Work detail — sticky meta, scrolling media

Server components throughout, except the rail — see the last paragraph of this section.

- CSS Grid: `grid-template-columns: minmax(0, 5fr) minmax(0, 7fr)` above 1024 px.
- Left cell contains `WorkMetaPanel` inside `StickyColumn` (`position: sticky;
  inset-block-start: var(--space-pin)`). Pure CSS sticky — no scroll listener. The offset is
  `--space-pin` and not `--space-header` deliberately: it is the line the panel already
  rests on, so it pins on the first pixel of scroll rather than sliding `--space-xl` upward
  to meet the header first. The rail shares it. Neither column ever moves.
- Right cell is `MediaSequence`. It takes `cover` and `media` as separate props: the cover
  leads the column, eager and `fetchPriority="high"`, and is also the half of the
  shared-element morph that lands here (§5.4). Starting the column at `media[0]` instead
  would have the browser moving one rectangle while crossfading two different photographs
  inside it. The rest follow lazily, each in a `Focus` and each in a `Parallax`.
- Under 1024 px the grid becomes one column, the meta panel un-sticks and sits above the
  media. `StickyColumn` handles this by only applying `position: sticky` inside the
  `min-width: 1024px` query.
- The far-left rail (`WorkRail`, MOTION.md §7) is the one client component on the route, and
  what makes it one is the hover figure rather than the navigation: it holds the same
  `previewed` state `WorkIndex` does and renders the same `HoverMediaLayer`, so resting on a
  number raises that work's cover full-bleed behind the page and clicking it morphs the
  photograph into the next work's media column. Everything else is CSS on one data attribute —
  the page reads `[data-previewing]` through `:has()` and each part dims itself to
  `--preview-dim`, which §7.1 of the motion plan explains is not the same thing as dimming the
  container.

### 5.3 Scroll motion — the big.dk cadence

There is no `Reveal`, and its absence is the design. An entrance is a state a back
navigation can catch an element in: return to a page, and everything below the fold is
briefly at its start keyframe. Media therefore has no entrance at all — it has a *focus
curve*, biggest at the centre of its pass and smaller at both edges, symmetric so it reads
the same scrolling either way and has no start state to be caught in. MOTION.md §6.

The mechanism is one pair of stylesheets and one object:

- `lib/choreography.ts` — the `scenes` table: which trigger and which effect each surface
  gets, and at what depth. A surface reads its preset and spreads `sceneAttrs(...)` onto the
  element that is already there, so no wrapper div lands between a grid and a placed child.
- `styles/motion/triggers.css` — *when*: `scrub`, `batch`, `progress`, `stack`, `pin-scrub`,
  each an `animation-timeline: view()` or `scroll()` range.
- `styles/motion/effects.css` — *what*: `focus`, `slide`, `rise`, `split`, `pan`, and the
  rest of the §5.4 vocabulary, scaled by `--eff-depth`.

`Focus`, `Parallax` and `Recede` in `components/motion/` are the three wrappers that need an
element of their own, because they animate one thing inside another; everything else is an
attribute on existing markup. All of it is CSS on the compositor, so the whole system is
Server Components and ships no JavaScript — the fallback observer that `Reveal` needed went
with it.

**Reduced motion** is `globals.css` collapsing every duration, plus the two places a `*`
selector cannot reach: `styles/motion/` cancels the `::view-transition-*` animations
explicitly, and each scroll-driven module sets `animation: none !important` with a stated
resting value, because a timeline driven by position is not stopped by a zero duration.

### 5.4 Navigation — the page never cuts

The rule this replaces said there would be no page transitions. There are, and they are the
point of the site rather than a decoration on it.

- `next.config.ts` sets `experimental.viewTransition`. `components/motion/PageTransition.tsx`
  wraps `{children}` in the layout in React's `<ViewTransition default="page">`. That is the
  entire integration: React starts a browser view transition for any navigation inside it,
  and every rule that shapes one lives in `styles/motion/`.
- **The page.** `::view-transition-old(.page)` recedes to `--page-recede` and fades over
  `--dur-base`; `::view-transition-new(.page)` arrives from `--page-arrive` over `--dur-slow`
  after `--dur-fast` of overlap. 140 + 560 = 700 ms, which is `--dur-scene` — the longest
  value DESIGN-SYSTEM.md §6 permits, so no new duration was introduced.
- **The group is pinned** (`animation: none`). Pages are different heights, and letting the
  group interpolate between two of them stretches both snapshots on the way. That squashed
  rubber is what makes most view-transition demos look cheap.
- **The header does not travel.** It carries `view-transition-name: var(--vt-header)`, which
  lifts it out of the page snapshot, and both its group and its new image are pinned. It is
  identical on every page, so moving it would be motion carrying no information — and it is
  the one fixed thing the eye can hold while the content moves.
- **The shared element.** The works index's hover backdrop and the first image of
  `MediaSequence` both carry `view-transition-name: var(--vt-cover)`. The browser pairs them,
  so clicking a row does not crossfade two pictures — it moves one, from full bleed to the
  width of the media column. This is the interaction the site exists to demonstrate.
  `::view-transition-image-pair` blurs by `--morph-soften` at the midpoint, which hides the
  resampling between two very different rectangles and resolves to nothing at both ends.
- **Touch.** The backdrop does not exist without a fine pointer, so the row's own inline
  cover takes the name instead — but only the row a press has committed to, tracked as
  `chosen` in `WorkIndex` and set on `pointerdown`. `previewed` cannot do this job: on touch
  it is already back to `null` by the time the click navigates. The two branches never
  collide, because whichever element is not in use is `display: none` on that device and an
  unrendered element is not captured.
- **Names are tokens.** A `view-transition-name` has to be the same ident in two different
  stylesheets for the pairing to happen. `--vt-header` and `--vt-cover` are declared in
  `tokens.css` so it is not written twice as a literal — CLAUDE.md §4.

### 5.5 Scroll-driven motion — big.dk's cadence, on the compositor

Three wrappers in `components/motion/`, each pure CSS and each a Server Component:

| | What it does | Range |
|---|---|---|
| `Focus` | media comes up to size at the centre of its pass | the full `view()` pass |
| `Parallax` | media drifts `±--drift` inside a clipped frame | the full `view()` pass |
| `Recede` | a block shrinks and dims as it leaves the top | `exit 0%` → `exit 100%` |

- `Focus` and `Parallax` compose by nesting, never by stacking two animations on one
  element: the outer one scales the frame, the inner one pans the picture inside it.
- `Parallax` is two elements on purpose. The drift has to be clipped or it pushes into
  whatever is below, and the inner element is scaled 1.08 so the translate never exposes a
  sliver of paper at an edge.
- `Recede` is the same figure a navigation makes, at the same magnitude. That is deliberate:
  scrolling a section off the top and clicking a link should read as one vocabulary.
- Parallax and Recede are `linear`. A scroll-linked animation with an easing curve feels
  like the page is fighting the pointer; easing belongs on things with a beginning and end.
- The site's only two scroll listeners would have been the header rule and the reveals.
  Neither exists: the header rule is an `animation-timeline: scroll()` and the reveals are
  `view()`.

**Reduced motion.** `globals.css` collapses every duration under the query, but it cannot do
this job alone and both exceptions are written down where they apply. A `*` selector does not
match `::view-transition-*`, so `styles/motion/` cancels those explicitly; and a scroll-driven
animation is driven by position rather than time, so a zero duration does not stop it — each
of the three modules sets `animation: none !important` and states the resting value.

---

## 6. Image pipeline

There isn't one, and that is the design.

Originals live in an R2 bucket under the key the content record names —
`works/edible-house/01.jpg`. Their intrinsic dimensions were measured by the admin when
they were uploaded and travel in the content bundle. `lib/media.ts` turns a key and a width
into a URL:

```
/cdn-cgi/image/width=768,quality=78,format=auto,fit=scale-down/<mediaBase>/<key>
```

Cloudflare fetches the original, resizes it, encodes it, and caches the result. `format=auto`
picks AVIF or WebP from the request's `Accept` header, so one `srcset` replaces the two
`<source>` elements this used to need. `fit=scale-down` never enlarges, which is what makes
the width ladder `[480, 768, 1200, 1800, 2400]` safe to apply to an original of any size —
a 900px photograph yields 480 and 900, exactly as the old `targetWidths()` did.

`MediaFrame.tsx` emits:

```html
<picture>
  <img src="…width=1800…" srcset="…width=480… 480w, …width=1200… 1200w" sizes={sizes}
       width={w} height={h} alt={alt} loading="lazy" decoding="async">
</picture>
```

No wrapper div: the intrinsic `width`/`height` attributes give the browser the ratio and
`height: auto` holds the box open, which is one element fewer for the same zero CLS. Those
dimensions come from the bundle, not from the file, which is why the admin measures them
from the uploaded bytes rather than trusting a form field. `sizes` is a required prop —
forgetting it is the single most common cause of over-downloading, so the type forbids it.
A key the bundle does not describe throws rather than rendering a broken `<img>`.

**Cost.** Roughly 355 unique transformations a month against a free allowance of 5,000. A
"unique transformation" is one combination of options on one original per month; every
subsequent request for it is a cache hit.

**The `<picture>` stays** even with nothing inside it but the `<img>`. globals.css gives it
`display: block` at element specificity and `WorkIndexRow` depends on beating that from its
own module — see the comment in `MediaFrame.module.css`. Collapsing it to a bare `<img>`
would move that fight to a different element and re-open a view-transition bug.

---

## 7. What is deliberately absent

Listed so it stays absent:

- No CMS, no `getStaticProps`-style data fetching, no API routes, no server actions.
- No global state. The one piece of shared client state (hovered work) is `useState` inside
  `WorkIndex`.
- No i18n, form, icon, carousel, lightbox or UI library.
- No dark mode. The palette is near-monochrome by design; a second theme adds tokens,
  testing surface and contrast bugs for no editorial gain. Revisit only if asked.
- No animation library, still. What replaced the "no page transitions" line that used to sit
  here is not a library — see §5.4. That entry was written on the assumption that a page
  transition means a JS router animating a tree it owns, which is what fights back/forward
  and breaks focus. The View Transitions API is the browser doing it: history and focus are
  handled by the same code that handles them without it.
- No smooth-scroll library. Lenis was named in an early draft of this file and is absent on
  purpose. It replaces the scroll position with an interpolated one, which desynchronises
  every `animation-timeline: view()` on the page — it would break §5.5 to add a feel that
  §5.5 already produces, and cost ~10 KB to do it.
- No analytics until asked; if added, it is a single `<script defer>` from a
  cookieless provider, nothing bundled.
