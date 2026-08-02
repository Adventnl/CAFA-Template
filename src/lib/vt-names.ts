/**
 * The view-transition name registry. MOTION.md §3.
 *
 * A view-transition-name has to be the same ident in the element that carries it
 * and — for the static ones — in the figure stylesheet that animates it. The
 * split, and why it is not one table:
 *
 *   - The *structural* names (stage, header, rail, heading, meta, pager,
 *     chrome-nav) are fixed. They live as `--vt-*` custom properties in
 *     tokens.css, because a component sets them through `var(--vt-…)` while the
 *     figure stylesheets have to name them literally: `::view-transition-group()`
 *     takes an ident, and an ident cannot be a `var()`. The literal therefore
 *     appears once in styles/motion/ and once as a token value, never inside a
 *     component — CLAUDE.md §4.
 *
 *   - The *per-slug* names (cover-{slug}, rail-{slug}) cannot be tokens: there is
 *     one per work. They are computed here and set through inline style. The
 *     figure stylesheets never name them; they target the accompanying
 *     view-transition-class instead (`::view-transition-group(.cover)`), which is
 *     what lets one rule animate every work's cover without knowing the slugs.
 *
 * This module owns the per-slug names. The classes they also carry are set in
 * CSS from the --vt-class-* tokens (a value that never varies by slug), so there
 * is no matching JS map here. The comment above is the static half's whole
 * documentation.
 */
export const vtName = {
  /** The clicked work's cover: full-bleed backdrop ⇄ detail hero, morphed. */
  cover: (slug: string): string => `cover-${slug}`,
  /** One rail entry: the clicked number travels, its siblings unzip away. */
  railEntry: (slug: string): string => `rail-${slug}`,
  /**
   * One repeated thing inside a listing — a programme, a mentor.
   *
   * Keyed rather than positional, and that is the whole design: `item-3` on two
   * different pages would pair, and the browser would morph a programme entry
   * into a mentor card because they happened to be third. Keyed by slug they
   * never pair, so every one is an only child and leaves or arrives on its own
   * — which is what the figures actually want. The staggering is carried by the
   * step classes alongside (tokens.css, --vt-step-*), because a
   * ::view-transition-* pseudo-element cannot be reached by :nth-child.
   */
  item: (key: string): string => `item-${key}`,
} as const;
