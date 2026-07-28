# c.a.f.a Atelier 央艺 — Repo Constitution

Read this before every change. These are rules, not suggestions. If a request conflicts
with a rule here, say so and propose the compliant alternative instead of silently
breaking the rule.

## 1. What this is

A static, frontend-only marketing and portfolio site for an art / design / architecture
portfolio-education atelier. **There is no backend, no database, no auth, no API routes,
no server runtime.** The build output is HTML, CSS, JS and images on a CDN.

Stack, fixed:

- Next.js (App Router) with `output: 'export'`
- TypeScript, `strict: true`
- Plain CSS Modules + CSS custom properties. No Tailwind, no CSS-in-JS runtime.
- `motion` (the `m` + `LazyMotion` subset only) for the handful of animations CSS cannot do
- `sharp` in a build script for responsive image derivatives
- Locales: `zh` (default, served at `/`), `en` (served at `/en`)

Do not add a dependency without an explicit instruction. If you believe one is needed,
stop and ask, naming the exact bytes it adds.

## 2. Design references (what "good" means here)

- **ium.jp** — the index-as-interface. A dense, quiet list of works; hovering a row
  fills the viewport behind it with that work's image while the list dims. Detail pages
  are a sticky left metadata column against a scrolling right media column.
- **big.dk** — the scroll feel. A centred vertical feed, generous rhythm, media that
  settles into place as it enters view. Motion is calm and mechanical, never bouncy.
- **sanaa.co.jp** — the homepage. Almost nothing on screen. Confidence through absence.

The taste rule: **the design is the restraint.** When unsure between adding and removing,
remove. No gradients, no shadows, no rounded corners, no accent colours, no icons that
aren't content, no hero copy that explains what the visitor can already see.

## 3. Layering — the rule that matters most

```
app/  →  components/composites/  →  components/{primitives,motion}/  →  lib/, styles/tokens
```

Dependencies point **down only**. A lower layer never imports from a higher one.

- **`app/` (routes)** — assembles. A page file may: read content via `lib/content`, choose
  which composites to render, and pass props. A page file may **not**: contain literal
  display strings, contain CSS beyond a page-level layout module, contain conditional
  rendering logic more than one level deep, or define a component inline.
  **Pages only ever call existing components.** If a page needs something that doesn't
  exist, build the component first, in `components/`, then call it.
- **`components/composites/`** — knows the domain (a work, a programme, a mentor). Built
  *from* primitives. Receives data as props; never imports `lib/content` itself.
- **`components/primitives/`** — knows nothing about this business. `Text`, `Media`,
  `Grid`, `Field`. Could be lifted into another project unchanged.
- **`components/motion/`** — behaviour wrappers only (`Reveal`, `StickyColumn`,
  `HoverMediaLayer`). They render `children`; they never style content.
- **`lib/`** — pure functions and typed content loaders. No JSX, no DOM.

## 4. Hardcoding is a defect

Every one of these is a bug, not a style preference:

- A display string in a `.tsx` file. All copy lives in `content/`, keyed by locale.
- A colour, size, duration or easing as a literal. All values come from `styles/tokens.css`
  via `var(--…)`. The only permitted raw numbers in CSS are `0`, `1`, `100%`, and values
  inside a `clamp()` that is itself defining a token.
- A route path written as a string in a component. Routes come from `lib/routes.ts`.
- An image dimension, aspect ratio or alt text typed into a component. It comes from the
  content record.
- A work, programme, mentor or nav item spelled out in JSX. It comes from `content/`.

Test: **adding a new work must require editing exactly one content file and adding image
files. Zero code changes.** If that isn't true, the architecture is wrong — fix it.

## 5. YAGNI

Build what the current page needs and nothing else.

- **Rule of three.** Do not abstract until the third real use. Two similar blocks stay
  duplicated; the third one earns a component.
- No config option, prop, variant or theme that nothing currently uses. No `size="xl"`
  because it might be handy.
- No state manager, no data-fetching library, no i18n library, no form library, no
  animation library beyond the one named above, no icon package, no UI kit.
- No barrel files (`index.ts` re-exports). Import from the real path.
- No `utils.ts` / `helpers.ts` catch-alls. A function lives in a file named for what it does.
- No test scaffolding, storybook, or CI beyond the deploy workflow unless asked.

## 6. And its counterweight: don't shatter the codebase

YAGNI is not a licence for one-file-per-symbol.

- One component per file, but **a component's types, styles-adjacent constants and small
  private subcomponents live in that same file.** A composite is typically 60–150 lines.
- A file under ~30 lines that is imported by exactly one other file should probably be
  inlined into it.
- A folder with one file in it should not be a folder.
- Prefer ~25 well-named files over 200 fragments. Navigability is a performance feature
  for humans.

## 7. Performance budgets — enforced, not aspirational

Measured on the deployed build, mobile emulation, 4× CPU throttle, Slow 4G:

| Metric | Budget |
|---|---|
| LCP | < 1.8 s |
| CLS | < 0.02 |
| INP | < 200 ms |
| JS transferred, any route | < 110 KB gzip |
| Lighthouse Performance / A11y / Best Practices / SEO | ≥ 95 each |

Rules that keep this true:

- **Server Components by default.** `'use client'` only on a component that genuinely needs
  state, effects or event handlers — and push it as far down the tree as possible. A page
  is never a client component.
- **Never animate anything but `transform`, `opacity`, `filter` and `clip-path`.** Animating
  `width`, `height`, `top`, `left`, `margin` or `background-color` is a defect.
- Every image and video element declares intrinsic `width`/`height` (or an
  `aspect-ratio` box). CLS from media is unacceptable.
- Images: AVIF with WebP fallback, `srcset` + `sizes` on every one, `loading="lazy"` and
  `decoding="async"` except the LCP image, which is eager with `fetchPriority="high"`.
- Fonts: self-hosted `woff2`, subset, `font-display: swap`, preloaded, with a metric-matched
  fallback in the `font-family` stack so the swap doesn't shift layout.
- No scroll or resize handler without `passive: true`; prefer `IntersectionObserver`,
  `ResizeObserver` and CSS scroll-driven animations over listeners. Any handler that must
  exist is `requestAnimationFrame`-throttled and does its DOM reads and writes in separate
  phases.
- No layout-thrashing loops: never read `getBoundingClientRect()` inside a write phase.

## 8. Motion

- One easing vocabulary and one duration scale, both tokens. Nothing bouncy, nothing
  elastic, nothing longer than 700 ms.
- Default technique, in order of preference: (1) CSS transition triggered by a class an
  `IntersectionObserver` adds, (2) CSS scroll-driven animation (`animation-timeline: view()`)
  where supported, with (1) as the fallback, (3) `motion` only for shared-element and
  hover-image transitions that the first two cannot express.
- **`prefers-reduced-motion: reduce` disables all of it.** Not "reduces" — content appears
  in its final state immediately. This is a single mechanism in one place, not a check
  sprinkled across components.
- Smooth-scroll (Lenis) is desktop-pointer-only, off on touch, off under reduced motion.
  Native momentum scrolling on mobile beats anything we write.

## 9. Responsive & device

- Fluid by default: `clamp()` on type and spacing against the token scale. Breakpoints are
  an escape hatch for layout changes, not the primary tool.
- **Container queries** for components that appear in more than one column width. A
  component should respond to its container, not the viewport.
- `dvh`/`svh`, never `vh`. Respect `env(safe-area-inset-*)`.
- Hover effects live inside `@media (hover: hover) and (pointer: fine)`. The ium hover-image
  interaction must have a defined touch behaviour — decide it, don't inherit it.
- Interactive targets ≥ 44 × 44 px. Text never below 14 px.
- Verify at 320, 390, 768, 1024, 1440, 1920 and 2560 px before calling anything done. The
  reference failure mode we are avoiding: a beautiful left column and a permanently empty
  right half of the screen.

## 10. Accessibility

Non-negotiable and cheap if done from the start.

- Semantic landmarks, one `h1` per page, headings in order.
- Visible `:focus-visible` ring on every interactive element, using a token.
- Skip-to-content link.
- `alt` is a **required, non-optional field** on the image type in the content schema, so it
  cannot be forgotten. Decorative images use `alt=""` explicitly.
- Keyboard parity: anything reachable by hover must be reachable by Tab.
- Colour contrast ≥ 4.5:1 for body text. "It's an art site" is not an exemption.

## 11. Definition of done

Before you report a task complete:

1. `npm run build` succeeds with zero TypeScript errors and zero ESLint warnings.
2. No `any`, no `@ts-ignore`, no `console.log`, no commented-out code, no TODO left behind.
3. No dead exports and no unused files. If you replaced something, delete the old one.
4. Checked at 390 px and 1440 px minimum.
5. Keyboard-navigated the new surface once.
6. Re-read sections 3, 4 and 5 against your diff. Hardcoded strings and pages that grew
   their own components are the two failures that recur — look for them specifically.
