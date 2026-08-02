# Motion Plan — the canvas

The brief: the site should not read as a sequence of pages. It should read as one
continuous surface that the viewer moves across. Clicking a menu item does not swap a
document — the menu compresses, slides aside, and the thing it pointed at arrives in the
space it left. Scrolling is not a reveal-once event — every surface on the site is tied to
the scroll position, moving continuously the whole time it is on screen.

This document is the plan. It is ordered: phase 0 must land before anything else, because
the current transition machinery actively fights the thing we are building.

**Decisions taken (2026-07-29):** the works index compresses into a **persistent left rail**
that survives onto the detail page — option A, specced in §7. Real photography is coming;
motion values are tuned generically for now and re-tuned against real plates later.

---

## 0. What is wrong now, precisely

Not opinions — five defects, each with a mechanism.

### 0.1 The page is snapshotted whole, and the snapshot is stretched

`styles/motion.css:42`

```css
::view-transition-group(.page) { animation: none; }
```

Removing the group animation does not "pin" the group. It leaves the group at the **new**
element's geometry for the whole transition, while `::view-transition-old(.page)` is a
bitmap captured at the **old** element's geometry. `::view-transition-old` defaults to
`object-fit: fill`. So the outgoing page is scaled to whatever the incoming page's box is.

The works index is roughly 2 200 px tall. A work detail page is roughly 5 500 px. Every
click therefore squashes the outgoing snapshot to ~40% of its height while fading it. That
is the "the page is slightly different" artifact — and it is exactly the squashed-rubber
failure the comment above that rule says it is avoiding.

It is also expensive: we ask the compositor for a 5 500 px-tall texture of the entire
document on every navigation.

**Fix:** stop naming the page. Name parts. Phase 2.

### 0.2 The images drop down

Two vertically-opposed animations are stacked on the same element in
`components/composites/MediaSequence.tsx:37-41`:

```jsx
<Reveal>          {/* translate3d(0, 18px, 0) → 0,  range: entry 0% → entry 80% */}
  <Parallax>      {/* translateY(+3.5%) → -3.5%,   range: (unset) → cover 0% → cover 100% */}
```

`Parallax` never declares an `animation-range` (`Parallax.module.css:30`), so it inherits
the default `cover 0% cover 100%`. At `cover 0%` the drift is at `+3.5%` — below rest. The
`Reveal` starts at `+18px` — also below rest. For a 600 px plate the image therefore enters
about **39 px below where it belongs**, inside a frame that is `overflow: clip`, and rises
out of it. That is the drop.

It is worse on back-navigation, which is 0.3.

### 0.3 Back-navigation replays every entrance from scroll 0

Next's App Router restores scroll position *after* React commits. Scroll-driven timelines
resolve at paint. So for at least one frame after a back navigation the document is at
`scrollY = 0`, every below-fold `Reveal` resolves to its `from` state, and then scroll jumps.
Everything drops at once.

The `@supports not` fallback branch is worse still: `Reveal` renders `data-reveal="pending"`
on mount (`Reveal.tsx:58`), so on any remount an element the reader had already scrolled past
starts at `opacity: 0` again and waits for an observer.

**Fix, and it is a rule not a patch: entrance animations run on forward navigation only.**
Going back is a restoration, not a performance. Phase 1 carries the flag that makes this
expressible. Note that scrubbed animations are exempt — they have no entrance, which is one
more reason to prefer them.

### 0.4 `chosen` is never cleared

`WorkIndex.tsx:37` — the comment says "deliberately never cleared." On a hybrid device (a
touchscreen laptop satisfies `hover: hover and pointer: fine` for its mouse while still
firing touch pointer events) the row's inline cover can hold `view-transition-name:
work-cover` at the same moment the hover backdrop claims it. Duplicate view-transition-names
make the browser **abort the entire transition** — a hard cut, with no warning in the UI.
Clear it when the transition settles, and add a dev-only uniqueness assertion.

### 0.5 And the real problem: there is no vocabulary

Three behaviours exist — `Reveal`, `Recede`, `Parallax`. `Reveal` is applied identically in
six places with no variant, no direction, no awareness of what it wraps or where the viewer
came from. There is nothing to compose, so every surface looks the same. Everything below is
about building the vocabulary; phase 0 only clears the ground.

---

## 1. The model

Four ideas carry the whole system. Everything after this is an application of one of them.

**One — navigations have an intent.** A route change knows semantically what it is: entering
a work from the index, stepping sideways through the pager, coming back out, moving laterally
along the nav bar, switching locale. That intent is written to `<html>` *before* the
transition starts, and all choreography is keyed off it. This is what ends "one animation
everywhere": a single named element gets seven different exits depending on the figure.

**Two — the browser interpolates parts, not pages.** Every meaningful element carries a
`view-transition-name`. A transition is then a set of simultaneous, individually-timed
element moves. Watching things you can still see travel to new positions is the entire
illusion.

**Three — everything on the site is scroll-triggered.** Not "some things animate on scroll."
Every surface declares a trigger and an effect. Any element can drive animation on any other
element; sections can pin and scrub. This is §5 and it is the largest part of the work.

**Four — scroll is also continuous state.** Position, direction and velocity live as custom
properties on `:root`, so effects can respond to *how* you are scrolling, not just where you
are. This is what separates a moving page from a physical one.

---

## 2. Phase 1 — navigation intent (the spine)

New files:

- `src/lib/nav-intent.ts` — pure. Classifies `(fromPath, toPath)` into a figure and a
  direction. No DOM, no React.
- `src/components/motion/NavStage.tsx` — `'use client'`, mounted once in the locale layout.
  ~70 lines.

Figures, and this is the full set:

| figure | from → to | direction source |
|---|---|---|
| `enter-work` | index → work | — |
| `exit-work` | work → index | — |
| `step-work` | work → work (pager or rail) | sign of the two works' `index` fields |
| `lateral` | any nav-bar page → another | order of items in `content/site.ts` |
| `descend` | home → anything | — |
| `ascend` | anything → home | — |
| `locale` | zh ↔ en, same page | — |
| `restore` | popstate, any direction | — |

`NavStage` writes `data-figure`, `data-dir` (`1`/`-1`) and `data-restoring` on
`document.documentElement` inside the click / `popstate` handler, i.e. **before** React begins
the transition. CSS reads them. Nothing else is JS.

It also owns scroll restoration: `history.scrollRestoration = 'manual'`, a `Map` of history
key → `scrollY`, applied synchronously before the transition begins so no timeline ever
resolves against a stale scroll position. This is the fix for 0.3.

Cost: ~1.4 KB gz. It ships no animation code at all.

---

## 3. Phase 2 — named parts

Delete the page-level `<ViewTransition default="page">`. Replace with a name registry,
`src/lib/vt-names.ts`, so a name is written once and read from two stylesheets (the current
`--vt-cover` token approach, generalised):

| name | element | role in the figure |
|---|---|---|
| `stage` | the page grid | the surface itself; shifts and scales |
| `rail` | the works rail | full-width list ⇄ compressed left rail |
| `rail-{slug}` | each rail entry | the clicked entry travels; siblings unzip away |
| `cover-{slug}` | hover backdrop ⇄ detail hero | the existing morph, now per-slug |
| `heading` | page `h1` | |
| `intro` | the block that says what the page is | Programmes' lead line, About's prose |
| `listing` | the page's main body of repeated things | programme list, mentor grid |
| `panel` | a self-contained card that *is* the page | contact only |
| `meta` | sticky metadata column | |
| `pager` | prev/next | |
| `chrome-nav` | header nav list | |

`intro`, `listing` and `panel` are named by **role, not by page**, and that is the whole
reason the section-to-section figures have anything to do. Programmes' intro and About's
prose share one identity, so the browser knows they occupy the same slot on the board and
a lateral move is an *exchange in a known position* rather than two unrelated fades.
Before they existed a section page named exactly one element — its heading — so every
figure between two section pages had a single sheet to slide and nothing to slide it
against. They all looked the same because they were the same.

They share the `part` view-transition-class, so what is true of all three (hold your own
height, hinge about your bottom edge) is written once in `base.css`. A fourth role should
be resisted: a role only one page uses is a part with nothing to pair against, and the
pairs are where the figures come from.

Per-slug names are the unlock. Today both the index and the detail page use one shared
`work-cover`, so only the cover can morph. With `rail-{slug}` and `cover-{slug}` the pager can
morph work→work, and the index can move *one* entry while the rest do something else.

### The signature move, `enter-work`, written out

The one the whole site is judged on. Every number below becomes a token.

```
t=0        pointer rests on row 007. cover-the-long-table fills the viewport
           behind the list under a 62% paper veil. (This exists today.)

0–140ms    the thirteen unclicked rows unzip. Each one translateX(-2rem) and
           fades, delayed by --stagger-step × min(|rowIndex − clickedIndex|, 6).
           The list peels away *from the row you chose*, not top-to-bottom.
           This is the "menu shrinks and goes off to the side" figure.

60–620ms   rail-007 travels left and up into the detail page's title slot. Its
           year and status columns are separate names and leave faster, so the
           row sheds detail as it goes rather than shrinking as a block.

80–760ms   cover-the-long-table morphs from full-bleed to the media column's
           first slot. The veil dissolves over the same interval — the photo
           comes up to strength rather than snapping. morph-soften blur peaks
           at 40%, resolves to 0 at both ends. (This part exists and is good.)

200–760ms  rail — the index reduced to a column of work numbers — scales in
           from the left edge and pins. The index is still on screen. This is
           the single detail that makes the navigation read as one canvas
           instead of two pages.

240–760ms  meta column rises 24px and fades in. pager last, from below.
```

`exit-work` is this sequence reversed, which is why the back button will stop feeling like a
different animation. `step-work` keeps `rail` and `meta` pinned and moves only the media and
the title, in the direction of `data-dir` — so the pager feels like paging, not navigating.

Roughly 40 named keyframe sets across the eight figures, living in `styles/motion/` split by
figure (`enter-work.css`, `lateral.css`, …) and imported once, because `::view-transition-*`
is document-scoped and cannot live in a CSS Module.

---

## 4. Phase 3 — scroll as continuous state

`src/components/motion/ScrollField.tsx` — `'use client'`, mounted once, ~70 lines, ~0.9 KB gz.

One `passive` scroll listener that does nothing but set a dirty flag. One rAF loop that reads
`scrollY` only (never `getBoundingClientRect`), and writes, in a single batched write phase:

- `--scroll-v` — smoothed signed velocity, clamped to ±1
- `--scroll-dir` — `1` / `-1`, latched through a deadzone so it does not flicker
- `--scroll-p` — 0…1 through the document
- `--px` / `--py` — pointer position, same loop, desktop only

The loop parks itself after 200 ms of stillness, so it costs nothing at rest.

What it buys, all in CSS, no further JS: media shears imperceptibly with velocity
(`scaleY(calc(1 + var(--scroll-v) * 0.02))`); hairlines strengthen while moving and settle
when still; entrances know whether you are scrolling up or down and use the matching figure.

This list once included "the sticky meta column lags the scroll direction by a few pixels".
It is struck out and must not be built. A pinned column is the fixed thing a work is read
against — the reason `--space-pin` exists is so it does not move even the once, when it
catches. Lagging it would put the movement back by hand. Velocity belongs to the media.

---

## 5. Phase 4 — the trigger system

**This is the core of the request and the largest phase.** Every surface on the site is tied
to the scroll position. Nothing is static.

### 5.1 The mechanism — any element drives any other

The capability that makes a trigger system possible, rather than just "elements animate as
they enter," is **named timelines**. An element declares a timeline; a completely different
element consumes it:

```css
/* the trigger — declares a timeline from its own position in the scrollport */
.plate {
  view-timeline-name: --plate;
  view-timeline-axis: block;
}

/* the scope — makes the name visible to elements that are not descendants */
.work-page { timeline-scope: --plate; }

/* the target — a different element entirely, in a different column */
.meta-panel {
  animation: dim linear both;
  animation-timeline: --plate;
  animation-range: entry 40% exit 60%;
}
```

That is `ScrollTrigger.create({ trigger: '.plate', animation: tl, scrub: true, start: 'top
80%', end: 'bottom 20%' })` — with no JS, and running off the main thread. `timeline-scope`
is the piece that turns scroll-driven animation from a per-element effect into a real trigger
system, and it is the single most important CSS feature in this plan.

### 5.2 Pinning with scrub

ScrollTrigger's `pin: true` + `scrub: true`, natively: a tall track buys scroll distance, a
sticky child holds still inside it, and the `contain` range is exactly the pinned duration.

```css
.track   { block-size: 300svh; view-timeline-name: --pin; }
.pinned  { position: sticky; inset-block-start: 0; block-size: 100svh; }
.pinned > * {
  animation: whatever linear both;
  animation-timeline: --pin;
  animation-range: contain 0% contain 100%;
}
```

`contain` is the span during which the track fully covers the viewport — i.e. precisely the
frames where the sticky child is stuck. Three hundred viewport-heights of track is three
hundred viewport-heights of scrub. Everything ScrollTrigger's pinning does, except that the
browser does it on the compositor.

Horizontal-under-vertical falls straight out of it:

```css
@keyframes pan-track { to { transform: translate3d(calc(-100% + 100vw), 0, 0); } }
```

### 5.3 The trigger vocabulary

Eight kinds, defined once in `styles/motion/triggers.css`, applied by a single
`<ScrollScene kind="…">` component that does nothing but set attributes (server component —
zero bytes).

| kind | ScrollTrigger equivalent | mechanism |
|---|---|---|
| `scrub` | `scrub: true` | `animation-timeline: view()`, `linear` |
| `enter` | `toggleActions: play …` | `view()` + `animation-range: entry`, non-linear ease |
| `pin` | `pin: true` | sticky child in a tall track |
| `pin-scrub` | `pin` + `scrub` | above, `contain` range |
| `link` | `trigger: A, animate B` | `view-timeline-name` + `timeline-scope` |
| `progress` | document-level | `animation-timeline: scroll(root)` |
| `batch` | `ScrollTrigger.batch` | one shared timeline, staggered `animation-delay` |
| `snap` | `snap:` | `scroll-snap-type` on the section |

### 5.4 The effect vocabulary

Effects ride on triggers. Each is one keyframe set plus a `depth` parameter (0–3) that scales
its magnitude, so one file yields four behaviours.

| effect | what moves | notes |
|---|---|---|
| `focus` | scale 0.88 → 1 → 0.88 | peak at `cover 50%`; §6 |
| `drift` | internal pan ±2.5% | inside a clipped frame |
| `rise` / `fall` | translate ±Y | direction from `--scroll-dir` |
| `slide` | translate ±X | four directions, direction from `data-dir` |
| `unmask` | `clip-path` wipe | four directions; compositable |
| `split` | per-line type, staggered | one timeline, `nth-child` delays |
| `tilt` | `rotate3d`, ≤1.5° | perspective on the section |
| `shear` | `scaleY` from `--scroll-v` | the velocity term; §4 |
| `dim` | opacity → `--dim` | for things losing attention |
| `pan` | horizontal translate | under vertical scroll, §5.2 |
| `swap` | cross-dissolve two plates | while pinned |
| `recede` | scale + dim on exit | exists; retuned |

Eight kinds × twelve effects × four depths is the range being asked for, out of about
fourteen files. The combinations are data in `src/lib/choreography.ts`, not hand-written CSS
per surface.

### 5.5 Coverage audit — nothing is static

The rule is that every surface names a trigger. This table is the acceptance test.

| surface | trigger | effect |
|---|---|---|
| header hairline / nav | `progress` | `dim` on velocity; strengthens while moving |
| home — opening statement | `pin-scrub` | `unmask` per line while pinned, then `recede` |
| home — featured plate | `scrub` | `focus` d3 + `drift` d3 |
| works index — rows | `batch` | `slide` d1 assembling: number → title → disciplines |
| works index — row cover | `scrub` | `focus` d1 (touch only; a pointer device has the backdrop) |
| works index — hover backdrop | pointer | `drift` against `--px/--py` |
| works rail (detail) | `link` to media column | active number tracks the centred plate |
| work detail — media | `scrub` | `focus` d2 + `drift` d2 + `shear` |
| work detail — meta panel | `link` to media | `dim` while a plate is centred |
| work detail — pager | `progress` | `rise` over the last 15% |
| programmes — each entry | `pin-scrub` (brief) | `unmask` the description while pinned |
| about — studio sequence | `pin` + `pan` | horizontal filmstrip under vertical scroll |
| about — prose | `batch` | `rise` d0 per paragraph |
| mentors — grid | `batch` | `rise` d1, staggered by column |
| mentors — portrait | `scrub` | `focus` d1, nested inside the card |
| contact | `scrub` | `sway` d1 about the tack |
| footer | `progress` | `rise` at document end |

### 5.5a Ranged triggers and symmetric effects — a defect class

Four rows above changed after the vocabulary met real markup, and two of them were
fixing the same bug rather than changing our minds. Worth stating as a rule, because it
will otherwise be reintroduced:

**A symmetric effect must not ride a ranged trigger.** `focus` and `drift` go down, up and
back down again; `enter` and `batch` bind an animation to a *slice* of the pass
(`entry 0% → entry 50%`) with `animation-fill-mode: both`. So the curve completes during
the entrance and then holds its final keyframe — which for `focus` is the dimmed, shrunk
one. "mentors — grid: batch + focus d1" therefore left every mentor card permanently at
0.9 scale and 55% opacity once it had scrolled in. It looked like a loading state that
never resolved.

Effects that end where they started (`rise`, `fall`, `slide`, `unmask`) are safe on any
trigger. `focus` and `drift` belong on `scrub`, which runs the whole `cover 0% → 100%`
pass, or nowhere.

The fix is also the better design, which is usually the sign it is the right one: the
card assembles (`batch` + `rise`) and the portrait inside it focuses (`scrub` + `focus`),
each on its own element. That is the nesting §5.4 was built for, and it is what the
original "focus d1, staggered by column" was reaching for.

### 5.5b `pin` — a part figure, not a navigation figure

`styles/motion/pin.css` is the one file in `styles/motion/` that is not keyed to a route
change. The contact card is the only block on the site that is an *object* — a card with
edges, on the paper, rather than a region of it — and an object should be put down the
same way however you arrived at it. So the figure attaches to the `panel` part and
overrides whichever navigation figure brought it, for `lateral` and `descend` only;
`ascend` takes it off the board, and `locale` and `restore` leave it alone (a card that
never left should not re-arrive).

It wins on source order against equal specificity, which is why `index.css` imports it
after every navigation figure. That is fragile in exactly one way — reordering the
imports silently disables it — so both files say so.

### 5.6 Support and fallback

`animation-timeline`, `view-timeline-name` and `timeline-scope` are available in current
Chrome, Edge, Safari and Firefox. Everything above sits inside
`@supports (animation-timeline: view())`.

The fallback is one shared `IntersectionObserver` that adds a class, giving `enter` behaviour
and nothing else — no scrub, no pin, no link. This is deliberate and should not be "fixed":
emulating scrub in JS means a main-thread handler per element, which is the thing that makes
scroll-animated sites feel bad. Old browsers get a calm site; current ones get this one.

### 5.7 On GSAP

We are building the ScrollTrigger *behaviour*, natively. GSAP core plus ScrollTrigger is
~34 KB gz and runs every scrub on the main thread; the CSS above is 0 KB and runs on the
compositor. The features it would add that we genuinely cannot express are JS callbacks on
enter/leave, and multi-segment timelines with different easing per segment — neither of which
appears in §5.5. If a surface later needs one, that is the moment to reconsider, not now.

---

## 6. Phase 5 — the focus curve (media)

The behaviour described directly: biggest at the centre, shrinking away at both edges,
continuous. `src/components/motion/Focus.tsx` **replaces `Reveal`** on every media surface —
media stops having an entrance at all, which is what removes the back-navigation weirdness at
the root (there is no state to be in).

```css
@keyframes focus {
  from { transform: scale(var(--focus-min)); opacity: var(--focus-dim); filter: blur(var(--focus-blur)); }
  50%  { transform: scale(1);                opacity: 1;                filter: blur(0); }
  to   { transform: scale(var(--focus-min)); opacity: var(--focus-dim); filter: blur(var(--focus-blur)); }
}

.focus {
  animation: focus linear both;
  animation-range: cover 0% cover 100%;   /* explicit, unlike Parallax today */
  animation-timeline: view();
}
```

Peak at `cover 50%` is exactly the element centred in the viewport. The curve is symmetric,
so it looks identical scrolling up and down.

| depth | `--focus-min` | drift | blur | used by |
|---|---|---|---|---|
| 0 | 0.96 | ±1.2% | 0 | rail thumbnails, small portraits |
| 1 | 0.92 | ±2.0% | 1px | programme and mentor imagery |
| 2 | 0.88 | ±2.5% | 2px | work detail media column |
| 3 | 0.82 | ±3.5% | 3px | full-bleed plates |

Blur is desktop-only (`min-width: 1024px`), capped at the six elements that can be in view at
once, and is the first term to drop if the frame budget moves.

`Parallax` survives as the internal pan inside the focus frame, retuned and given its missing
explicit range.

---

## 7. Phase 6 — the rail (decision A)

The works index does not disappear when you open a work. It compresses.

**On `/works`** — the full-width list as today: number, title, disciplines, year, status, with
the hover backdrop behind it.

**On `/works/{slug}`** — the same component, `data-compressed`, rendered as a sticky left
column: just the numbers, `013 012 011 010 …`, with the active work's entry expanded to show
its title. Clicking any number is a `step-work` navigation. Above `--bp-lg` it is a
`position: sticky` full-height column at the far left; the metadata panel moves inboard to
make room.

**Below `--bp-lg` the rail is not rendered.** A rail on a 390 px screen costs width it cannot
afford, and the pager already answers the same question. This is a real decision, not an
omission.

**It is one component**, `WorkRail`, rendered by both routes and carrying the `rail`
view-transition-name in both. That is what lets the browser interpolate between the two
layouts instead of crossfading them — the list genuinely compresses, because it is the same
element in both states. This is the architectural change the "canvas" reading requires, and
it is why option A was the right call.

Its trigger (§5.5): `link`ed to the media column, so the active number tracks whichever plate
is centred as you scroll the work. The rail is a scroll position indicator and a navigation at
once.

### 7.1 The hover figure belongs to the rail too

The rail is the index compressed, so it hovers like the index. Resting on a number fills the
viewport behind the page with that work's cover — the same `HoverMediaLayer`, the same veil —
and the click that follows morphs that photograph into the next work's media column. Index →
work and work → work are then the same move, which is the whole argument for a persistent
rail: if the compressed index behaved differently from the full one, it would be a different
component wearing its name.

Three things make it work, and each is somewhere the naive version fails:

- **The figure does not change.** A rail click is still `step-work`. What turns the slide into
  a morph is only that the backdrop is already holding `cover-{next}` when the navigation
  starts, so that name is on both sides and the browser pairs it. `step-work.css` therefore
  slides `::view-transition-old(.cover):only-child` — a cover with no partner — and leaves a
  paired one to the morph in `base.css`. A pager click, which has no backdrop, is unchanged.
- **The active entry previews nothing.** Its cover is already this page's hero, and two
  elements holding `cover-{slug}` at once abort the transition rather than run it (§0.4).
- **The page behind steps back to `--preview-dim`, part by part.** Not one opacity on a
  container: a view-transition snapshot keeps an element's own opacity and drops its
  ancestors', so a part dimmed from above is captured at full strength and flashes back to
  full ink the instant you click. The hero, the metadata, the pager's links and the plates
  each carry it, at the one level in their subtree that is neither animated by a scene nor
  pinned by the reduced-motion rule.

---

## 8. Phase 7 — smooth scroll (last, and conditional)

A hand-rolled lerp scroll, ~1.2 KB, desktop fine-pointer only, off on touch, off under reduced
motion. It must drive real `scrollTo` rather than transforming a wrapper element — a
transformed wrapper breaks every timeline and every `position: sticky` in §5 and §7.

Built last and kept only if it measures clean. It reliably costs INP, and a laggy scroll is
worse than a plain one. Build, measure, decide.

---

## 9. Rules this bends, and the ones it does not

`CLAUDE.md` asks for conflicts to be named rather than broken silently. Named:

- **§5 YAGNI / rule of three — suspended for `components/motion/` and `styles/motion/`.** The
  motion layer is the product here; abstracting on the third use is the wrong threshold for a
  vocabulary that must be internally consistent from the first use.
- **§8 "nothing longer than 700 ms" — raised to 900 ms for `enter-work` and `exit-work` only.**
  A 760 ms move with a 140 ms stagger inside it needs the headroom or it reads as clipped.
  Every other figure stays under 700 ms. Scrubbed animations have no duration at all — they
  are position-driven — so the rule does not apply to §5.
- **§8 "one easing vocabulary" — kept.** This is what makes sixty animations read as one system
  rather than a mess. Two easings, plus one addition: `--ease-lead`, overshoot-free, for
  elements that must arrive ahead of their neighbours. Scrubbed animations stay `linear`,
  always — easing a scroll-linked animation makes the page feel like it is fighting the
  pointer.
- **§7 JS budget — held.** `NavStage` + `ScrollField` ≈ 2.5 KB gz; the trigger system ships
  zero. This is the argument for building it this way rather than reaching for GSAP.
- **New rule: the incoming half of a transition never carries a delay.** A delay on the
  *outgoing* half is free — the reader is still looking at a full-opacity page. A delay on
  the incoming half is dead air between the press and any visible response, and every
  figure here had inherited one of `--dur-fast`. 140 ms is well past the ~100 ms at which
  a pointer interaction stops feeling connected to its result, so every navigation on the
  site read as laggy, and was. The overlap the delay was buying is bought instead by
  running the two halves concurrently at different durations. Parts may still be
  staggered — that is choreography inside a move that has already visibly started.
- **And its corollary: nothing expensive runs in the click handler.** The dev-only
  duplicate-name audit was a `getComputedStyle` over every element in the document,
  called synchronously before the transition. It is now scheduled onto a macrotask, which
  still sees the outgoing DOM (React has not committed) and no longer sits between the
  press and the first frame.
- **§7 "only transform, opacity, filter, clip-path" — kept, without exception.** Not a style
  preference: animating layout properties drops the frame rate, and flow does not survive
  20 fps. Everything above is compositable.
- **§9/§10 — kept.** Keyboard parity for the hover figures, `prefers-reduced-motion` as one
  switch, contrast floors unchanged. Reduced motion must also cancel scroll-driven
  animations outright — a zero duration does not stop a position-driven timeline, which is a
  trap `Reveal.module.css:50` already handles correctly and every new effect must repeat.

Scope: ~34 new files, ~22 modified. Not 200 — the range comes from the trigger × effect ×
depth table, and 200 fragments would run slower and be impossible to keep coherent.

---

## 10. Order of work

| phase | contents | gate |
|---|---|---|
| 0 | the five defects in §0 | no visual regressions; back-nav is clean |
| 1 | `nav-intent`, `NavStage`, scroll restoration | `data-figure` correct for all 8 figures |
| 2 | named parts, the eight figures | `enter-work` reads as one continuous move |
| 3 | `ScrollField` | ≤1 rAF, parks at rest, no layout reads |
| 4 | trigger + effect vocabulary | §5.5 table fully covered |
| 5 | `Focus`, delete `Reveal` | no media has an entrance |
| 6 | `WorkRail` | rail interpolates between both layouts |
| 7 | smooth scroll | INP still under budget, or it is dropped |

Re-measure the §7 budgets after phases 2, 4 and 7. Phase 4 is the one most likely to move
them.
