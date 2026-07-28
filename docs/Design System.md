# Design System — c.a.f.a Atelier 央艺

Derived from ium.jp, big.dk and sanaa.co.jp. Everything here becomes
`src/styles/tokens.css`. Nothing in the codebase uses a value that isn't below.

---

## 1. What the references actually do

**ium.jp** — near-white ground, ink-black text, one type family, one weight, and type set
*small*: the works index runs at about 13 px with roughly 22 px row rhythm. Density reads as
confidence. The page has no containers, no cards, no borders — structure comes purely from
alignment to a grid. Detail pages set metadata at ~11 px against full-bleed media.

**big.dk** — a single centred media column roughly 310 px wide on desktop with enormous
surrounding whitespace, right-aligned labels in the left gutter. Uppercase, letter-spaced
secondary text. Black and white only; all colour comes from the photography.

**sanaa.co.jp** — an almost empty page. The lesson isn't a technique, it's a budget: the
homepage gets a logo, a short list of links, and nothing else.

**The synthesis for c.a.f.a:** ium's index-as-interface and metadata discipline, big.dk's
scroll cadence and gutter labelling, SANAA's emptiness on the homepage only.

---

## 2. Colour

Monochrome plus one warm paper tint. No accent colour — the work supplies all colour.

```css
:root {
  --c-paper:        #F7F6F2;  /* page ground, warm off-white */
  --c-paper-raised: #FFFFFF;  /* media wells, rare */
  --c-ink:          #14140F;  /* primary text */
  --c-ink-70:       rgb(20 20 15 / 0.70);  /* secondary text, metadata */
  --c-ink-45:       rgb(20 20 15 / 0.45);  /* tertiary: status, numbers */
  --c-ink-16:       rgb(20 20 15 / 0.16);  /* hairlines */
  --c-ink-dim:      rgb(20 20 15 / 0.28);  /* list colour while hover backdrop is active */
  --c-inverse:      #F7F6F2;               /* text over media */
  --c-focus:        #14140F;               /* focus ring */
  --c-scrim:        rgb(20 20 15 / 0.35);  /* over-media legibility */
}
```

Contrast check: `--c-ink` on `--c-paper` is ~15:1. `--c-ink-70` is ~10:1 — safe for
metadata. `--c-ink-45` is ~6:1, permitted for non-essential numerals only, never for body
copy. `--c-ink-16` is hairlines, never text.

---

## 3. Typography

**Latin:** a neutral grotesque. `Neue Haas Grotesk` / `Söhne` if licensed; free equivalent
`Inter` with `font-feature-settings: "cv05" 1, "ss03" 1` to reduce its quirks, or
`Suisse Int'l` if budget allows. One family. Weights **400 and 500 only** — the references
never go bolder.

**中文:** `Source Han Sans` / `Noto Sans SC` at weights 400 and 500. Subset aggressively —
a full CJK face is 8–20 MB. Build a subset from the actual strings in
`content/dictionaries/zh.ts` and the work titles; that lands under 200 KB. Load it with
`unicode-range` so Latin never triggers the CJK file.

Metric-matched fallback stack so the font swap doesn't shift layout:

```css
--font-sans: 'Inter var', 'Noto Sans SC', ui-sans-serif, system-ui, 'Helvetica Neue', sans-serif;
```

### Type roles

Every piece of text uses one of these six. `Text.tsx` takes `role` as a prop; there is no
seventh role and no ad-hoc `font-size` anywhere.

| Role | Size | Line height | Tracking | Weight | Used for |
|---|---|---|---|---|---|
| `display` | `clamp(2.25rem, 1.4rem + 3.6vw, 4.5rem)` | 1.02 | −0.02em | 400 | Home statement, work title on detail |
| `title` | `clamp(1.25rem, 1.05rem + 0.9vw, 1.75rem)` | 1.15 | −0.012em | 400 | Section heads, programme names |
| `body` | `clamp(0.9375rem, 0.9rem + 0.2vw, 1.0625rem)` | 1.62 | 0 | 400 | Prose |
| `index` | `0.8125rem` (13px) | 1.7 | 0 | 400 | The works list rows — fixed, not fluid |
| `meta` | `0.6875rem` (11px) | 1.55 | 0.01em | 400 | Credits, status, captions |
| `label` | `0.6875rem` (11px) | 1 | 0.09em, uppercase | 500 | Nav, gutter labels, buttons |

`index` and `meta` stay fixed rather than fluid: at these sizes fluid scaling either breaks
the 44 px touch floor on mobile or bloats absurdly at 2560 px. They step once at the `sm`
breakpoint instead (`index` → 14 px, `meta` → 12 px on touch).

CJK adjustment: Chinese needs more leading and no negative tracking. `:lang(zh)` raises
`line-height` by 0.12 on every role and zeroes `letter-spacing` on `display`/`title`.

---

## 4. Space

An 8 px base with a fluid multiplier. Nine steps, no more.

```css
--space-3xs: 0.25rem;   /*  4 */
--space-2xs: 0.5rem;    /*  8 */
--space-xs:  0.75rem;   /* 12 */
--space-s:   1rem;      /* 16 */
--space-m:   1.5rem;    /* 24 */
--space-l:   clamp(2rem,   1.6rem + 1.6vw,  3rem);      /* 32→48  */
--space-xl:  clamp(3.5rem, 2.6rem + 3.6vw,  6.5rem);    /* 56→104 */
--space-2xl: clamp(6rem,   4.2rem + 7.2vw, 11rem);      /* 96→176 */
--space-3xl: clamp(9rem,   6rem  + 12vw,  18rem);       /* 144→288 — between major sections */

--space-header: 4.5rem;      /* fixed header height; sticky offsets reference this */
--space-gutter: clamp(1.25rem, 0.6rem + 2.6vw, 3.5rem);  /* page edge padding */
```

The whitespace *is* the design. When a section feels wrong, the answer is almost always
`--space-2xl` or `--space-3xl` above it, not a border or a background change.

---

## 5. Grid

A 12-column grid, `--space-gutter` at the edges, `--space-m` between columns, max content
width `1680px` centred.

```css
--grid-cols: 12;
--grid-gap: var(--space-m);
--grid-max: 1680px;
```

Standard placements:

| Surface | Placement |
|---|---|
| Home statement | cols 1–7 |
| Works index rows | number 1, title 2–5, discipline 6–8, year/status 11–12 (right-aligned) |
| Work detail | meta cols 1–4 (sticky), media cols 6–12 |
| Programmes | label cols 1–2, body cols 4–9 (big.dk gutter-label pattern) |
| Prose (about) | cols 4–9, max 68 characters |

Breakpoints — four, used only for layout reflow:

```css
--bp-sm:  480px;
--bp-md:  768px;    /* index collapses 4 cols → 2; hover layer off */
--bp-lg: 1024px;    /* detail becomes two-column and sticky */
--bp-xl: 1440px;
```

Above 1920 px nothing grows except whitespace — `--grid-max` caps it, matching big.dk's
behaviour on wide displays.

Components that appear at more than one width use container queries, not these.

---

## 6. Motion

Two easings. Four durations. Nothing else exists.

```css
--ease-out:  cubic-bezier(0.22, 1, 0.36, 1);      /* entrances, reveals */
--ease-io:   cubic-bezier(0.65, 0, 0.35, 1);      /* state changes, hover */

--dur-fast:   140ms;   /* colour/opacity on hover of small text */
--dur-base:   280ms;   /* most transitions */
--dur-slow:   560ms;   /* scroll reveals */
--dur-scene:  700ms;   /* hover backdrop crossfade — the longest permitted value */

--reveal-rise: 18px;   /* how far a Reveal element travels. Small. It should read as a settle, not a slide. */
--stagger-step: 70ms;  /* max 3 steps */
```

Rules that make it feel like the references rather than a template:

- **Nothing overshoots.** `--ease-out` decelerates to a stop. No spring, no bounce, no
  `cubic-bezier` with a value above 1 in the y-axis except the tail of `--ease-out`.
- **Travel is short.** 18 px, not 60. big.dk's calm comes from elements barely moving.
- **Opacity does most of the work.** If in doubt, fade and don't translate.
- Only `transform`, `opacity`, `filter`, `clip-path` are ever animated.
- One reveal per element, ever — `unobserve` on first intersection.
- Everything above collapses to zero under `prefers-reduced-motion: reduce`.

---

## 7. Component states

```css
--focus-ring: 0 0 0 2px var(--c-paper), 0 0 0 4px var(--c-focus);
--hairline: 1px solid var(--c-ink-16);
--radius: 0;   /* yes, zero. Every corner in this design is square. */
```

- **Links in prose:** underline at 1px with `text-underline-offset: 0.22em`; on hover the
  underline goes to `--c-ink-45`, the text stays. No colour change.
- **Index rows:** the row itself does nothing on hover; the *backdrop* changes and the other
  rows dim to `--c-ink-dim` over `--dur-base`. The hovered row stays at `--c-ink`. This
  inversion — dimming the siblings rather than highlighting the target — is the ium move.
- **Nav:** `label` role, `--c-ink-70` at rest, `--c-ink` on hover, `--dur-fast`.
- **Focus:** `--focus-ring` on `:focus-visible` only, never suppressed.
- **Disabled / private:** `--c-ink-45`, `cursor: default`, not a link at all.

---

## 8. The rules that produce the taste

Keep these visible during review:

1. Two type sizes on screen at once is usually correct. Four is usually a mistake.
2. No borders where whitespace can do the job. The only permitted rule is `--hairline`
   between index rows, and even that is optional.
3. No box has a background different from the page unless it contains media.
4. Metadata is small, grey, and left exactly where it was on the previous page. Consistency
   of position across pages is what makes a site feel authored rather than assembled.
5. Images are never cropped to a fixed aspect ratio globally — each keeps its own, and the
   column width is what's constant. This is why the reference sites feel like a portfolio
   and a grid of uniform thumbnails feels like a template.
6. The homepage should survive deleting half of it. Try it before shipping.
