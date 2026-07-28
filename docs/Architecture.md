# Architecture — c.a.f.a Atelier 央艺

Companion to `CLAUDE.md`. That file is the law; this is the map.

---

## 1. Stack decisions and why

| Decision | Choice | Reason |
|---|---|---|
| Framework | Next.js App Router, `output: 'export'` | Every route becomes real HTML at build time. A crawler and a cold visitor both get the works index without waiting on a bundle. File-based routing + `generateStaticParams` means new works generate pages with no code change. |
| Styling | CSS Modules + custom properties | Zero runtime, scoped by default, and tokens are the single source of truth. Tailwind would put design decisions back into JSX as literals — the exact thing §4 of the constitution forbids. |
| Animation | CSS first, `motion` (`LazyMotion` + `m`) second | ~5 KB for the subset vs ~34 KB for the full import. Most of what these reference sites do is a transform + opacity transition on an IntersectionObserver class. |
| Content | Typed TS modules in `content/` | No CMS, no fetch, no build plugin. Type errors catch a malformed work at compile time. MDX only if long-form prose appears later. |
| i18n | Route segment + dictionary | Two locales don't justify a library. `[locale]` segment, a `dictionaries/` map, `generateStaticParams` emits both trees. |
| Images | `sharp` build script → static derivatives | `next/image` optimisation is unavailable under `output: 'export'`. We generate AVIF/WebP at fixed widths at build time and hand-roll `srcset`, which is both faster and fully static. |
| Deploy | GitHub Pages or Cloudflare Pages | `out/` is the whole artefact. |

**The `next/image` caveat, handled.** `next.config.ts` sets `images: { unoptimized: true }`.
We never use `next/image`. `components/primitives/Media.tsx` renders a `<picture>` from a
manifest that `scripts/build-images.mjs` writes. This is the one place in the codebase that
touches image markup.

---

## 2. File tree

```
.
├── CLAUDE.md
├── ARCHITECTURE.md
├── DESIGN-SYSTEM.md
├── next.config.ts
├── tsconfig.json                    # strict, paths: "@/*" → "src/*"
├── scripts/
│   └── build-images.mjs             # sharp → derivatives + image-manifest.json
├── public/
│   ├── fonts/                       # subset woff2
│   └── media/
│       ├── source/                  # committed originals (gitignored if large → use LFS)
│       └── derived/                 # generated, gitignored
└── src/
    ├── app/                         # NOTE: no app/layout.tsx — see §4
    │   ├── (root)/
    │   │   ├── layout.tsx           # <html lang> for the two pages below
    │   │   ├── page.tsx             # `/` — static meta-refresh into the default locale
    │   │   └── not-found/page.tsx   # becomes out/404.html via scripts/emit-404.mjs
    │   └── [locale]/
    │       ├── layout.tsx           # <html lang>, SiteHeader + <main> + SiteFooter
    │       ├── page.tsx             # home — SANAA-minimal
    │       ├── works/
    │       │   ├── page.tsx         # ium-style index
    │       │   └── [slug]/page.tsx  # ium-style detail
    │       ├── programs/page.tsx
    │       ├── about/page.tsx
    │       └── contact/page.tsx
    ├── components/
    │   ├── primitives/
    │   │   ├── Media.tsx            # <picture>, srcset, intrinsic size, required alt
    │   │   ├── Text.tsx             # renders a token type-role as any element
    │   │   └── Grid.tsx             # the 12-col page grid
    │   ├── motion/
    │   │   ├── Reveal.tsx           # IO → class → CSS transition
    │   │   ├── StickyColumn.tsx     # position:sticky wrapper with bounds
    │   │   ├── HoverMediaLayer.tsx  # ium full-bleed hover backdrop
    │   │   └── SmoothScroll.tsx     # Lenis, desktop-pointer-only
    │   └── composites/
    │       ├── SiteHeader.tsx
    │       ├── SiteFooter.tsx
    │       ├── LocaleSwitch.tsx
    │       ├── PageHeading.tsx      # the one h1, in the same place on every page
    │       ├── WorkIndex.tsx        # the list + its hover backdrop
    │       ├── WorkIndexRow.tsx
    │       ├── WorkMetaPanel.tsx    # sticky left column on detail
    │       ├── MediaSequence.tsx    # scrolling right column on detail
    │       ├── ProgramList.tsx
    │       ├── MentorGrid.tsx
    │       └── ContactBlock.tsx
    ├── content/
    │   ├── site.ts                  # nav, socials, contact, locales
    │   ├── works/
    │   │   ├── index.ts             # ordered array, the only registry
    │   │   ├── portfolio-interface.ts
    │   │   └── …
    │   ├── programs.ts
    │   ├── mentors.ts
    │   └── dictionaries/
    │       ├── zh.ts
    │       └── en.ts                # same keys, enforced by a shared type
    ├── lib/
    │   ├── content.ts               # getWorks, getWork, getDictionary … — typed, pure
    │   ├── routes.ts                # every path in the site, as functions
    │   ├── image-manifest.ts        # typed read of the generated manifest
    │   ├── image-manifest.generated.json   # written by prebuild; committed so a
    │   │                            # fresh clone type-checks without a build
    │   └── types.ts                 # Work, Program, Mentor, LocalisedText, ImageRef
    └── styles/
        ├── tokens.css
        ├── globals.css              # reset + base element styles only
        └── *.module.css             # colocated next to their component instead
```

Roughly 45 files at completion. That is the target: not 12, not 200.

---

## 3. Content model

`src/lib/types.ts` — the contract everything else obeys.

```ts
export type Locale = 'zh' | 'en';

/** Every user-visible string in content/ is this shape. Never a bare string. */
export type LocalisedText = Record<Locale, string>;

export interface ImageRef {
  /** path relative to public/media/source, e.g. "works/edible-house/01.jpg" */
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
  cover: ImageRef;              // shown on hover in the index; also the LCP on detail
  media: ImageRef[];            // the scrolling right column, in order
}
```

Rules:

- `content/works/index.ts` is the **only** registry. It imports each work file and exports
  an ordered array. Adding a work = new file + one line here + images in
  `public/media/source/works/<slug>/`. No other file changes. Ever.
- A `private` work renders in the index as an unlinked row (dimmed, no hover image), exactly
  as ium does. This is data-driven — `WorkIndexRow` branches on `status`, and nothing else
  in the codebase knows the concept exists.
- `ImageRef` carries no dimensions. `scripts/build-images.mjs` measures the file and
  `lib/image-manifest.ts` hands the numbers to `Media`, so a content record cannot
  disagree with the image on disk and nobody has to type a pixel count.
- `lib/content.ts` exports pure functions only: `getSite()`, `getWorks()`, `getWork(slug)`,
  `getPrograms()`, `getMentors()`, `getDictionary(locale)` and `requireLocale(param)`.
  Components never import from `content/` directly; pages do, through `lib/content`.

---

## 4. Routing and i18n

```
/                    → redirect (static) to /zh        via app/page.tsx
/zh                  → home, Chinese
/zh/works            /zh/works/[slug]    /zh/programs   /zh/about   /zh/contact
/en                  → home, English
/en/works            …
```

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
- `lib/routes.ts` is the only place a path string exists:
  ```ts
  export const routes = {
    home:    (l: Locale) => `/${l}`,
    works:   (l: Locale) => `/${l}/works`,
    work:    (l: Locale, slug: string) => `/${l}/works/${slug}`,
    programs:(l: Locale) => `/${l}/programs`,
    about:   (l: Locale) => `/${l}/about`,
    contact: (l: Locale) => `/${l}/contact`,
  } as const;
  ```
- `LocaleSwitch` maps the current pathname to its counterpart by swapping the first
  segment. It never hardcodes destinations.
- `dictionaries/en.ts` is typed as `typeof zhDictionary`, so a missing key is a build error.

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

Server component. No client JS except `Reveal`.

- CSS Grid: `grid-template-columns: minmax(0, 5fr) minmax(0, 7fr)` above 1024 px.
- Left cell contains `WorkMetaPanel` inside `StickyColumn` (`position: sticky; top: var(--space-header)`).
  Pure CSS sticky — no scroll listener.
- Right cell is `MediaSequence`: the `media[]` array rendered as `Media` primitives, each
  wrapped in `Reveal`. First one is eager + `fetchPriority="high"`; the rest lazy.
- Under 1024 px the grid becomes one column, the meta panel un-sticks and sits above the
  media. `StickyColumn` handles this by only applying `position: sticky` inside the
  `min-width: 1024px` query.

### 5.3 Scroll reveal — the big.dk cadence

`Reveal` is ~30 lines and is the only reveal mechanism in the codebase.

```
<Reveal>            → <div data-reveal="pending">
IntersectionObserver (rootMargin: "0px 0px -12% 0px", threshold: 0.1)
  → data-reveal="visible"
CSS: [data-reveal="pending"]  { opacity:0; transform: translate3d(0, var(--reveal-rise), 0) }
     [data-reveal]            { transition: opacity var(--dur-slow) var(--ease-out),
                                            transform var(--dur-slow) var(--ease-out) }
     [data-reveal="visible"]  { opacity:1; transform: none }
@media (prefers-reduced-motion: reduce) { [data-reveal] { opacity:1 !important; transform:none !important; transition:none } }
```

- One shared observer instance for the whole page, not one per element.
- `unobserve` after first reveal. Elements never animate twice.
- A `stagger` prop sets `transition-delay` via a CSS variable, capped at 3 steps — beyond
  that it reads as slow, not choreographed.

---

## 6. Image pipeline

`scripts/build-images.mjs`, run via `prebuild`:

1. Walk `public/media/source/**`.
2. For each image emit AVIF + WebP at widths `[480, 768, 1200, 1800, 2400]`, skipping widths
   above the source's intrinsic width. Quality: AVIF 55, WebP 78.
3. Write `src/lib/image-manifest.generated.json`, variants grouped by format so the JSON
   types itself against `ImageEntry` without a cast:
   ```json
   { "works/edible-house/01.jpg": {
       "width": 3000, "height": 2000,
       "formats": { "avif": [{ "src": "/media/derived/…-480.avif", "width": 480 }],
                    "webp": [ … ] } } }
   ```
4. Cache by source mtime + size so rebuilds are incremental.

`Media.tsx` reads the manifest, emits:

```html
<picture>
  <source type="image/avif" srcset="…480.avif 480w, …1200.avif 1200w" sizes={sizes}>
  <source type="image/webp" srcset="…">
  <img src="…1200.webp" width={w} height={h} alt={alt} loading="lazy" decoding="async">
</picture>
```

No wrapper div: the intrinsic `width`/`height` attributes give the browser the ratio and
`height: auto` holds the box open, which is one element fewer for the same zero CLS.
`sizes` is a required prop — forgetting it is the single most common cause of
over-downloading, so the type forbids it. A missing manifest entry throws rather than
rendering a broken `<img>`.

---

## 7. What is deliberately absent

Listed so it stays absent:

- No CMS, no `getStaticProps`-style data fetching, no API routes, no server actions.
- No global state. The one piece of shared client state (hovered work) is `useState` inside
  `WorkIndex`.
- No i18n, form, icon, carousel, lightbox or UI library.
- No dark mode. The palette is near-monochrome by design; a second theme adds tokens,
  testing surface and contrast bugs for no editorial gain. Revisit only if asked.
- No page-transition router animation. It fights back/forward, breaks focus management and
  costs a client-side router. The reveal cadence already carries the feel.
- No analytics until asked; if added, it is a single `<script defer>` from a
  cookieless provider, nothing bundled.
