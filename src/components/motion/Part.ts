import styles from './Part.module.css';

/**
 * Lifting a block out of the page surface so a figure can move it.
 * MOTION.md §3.
 *
 * A route change can only choreograph elements the browser has been told to
 * track. Before this existed, a section page named exactly one — its heading —
 * so every figure between two section pages had a single sheet to slide and
 * nothing to slide it *against*. That is why they all looked the same: they were
 * the same. Naming three more blocks is what turns a page transition into an
 * ensemble, and it is the cheapest change in the whole motion system — no
 * component, no JavaScript, one class.
 *
 * The three roles, and why there are exactly three:
 *
 *   intro    the block that says what the page is — Programmes' lead line,
 *            About's prose, a work's summary.
 *   listing  the page's main body of repeated things — the works index, the
 *            programme list, the mentor grid.
 *   panel    a self-contained card that is the page rather than being on it.
 *            Contact only.
 *
 * They are roles, not pages, and that is the design: Programmes' intro and
 * About's prose share the identity `intro`, so the browser knows they occupy the
 * same slot on the board and a lateral move is an *exchange* in a known position
 * rather than two unrelated fades. Which is why adding a fourth role should be
 * resisted — every role that only one page uses is a part with nothing to pair
 * against, and pairs are where the figures come from.
 *
 * This returns a class rather than rendering a wrapper, which is the same
 * decision `sceneAttrs` took and for the same reason: these pages place their
 * children on the 12-column grid with `grid-column`, and a div inserted between
 * the grid and a placed child silently breaks the placement. The class lands on
 * the element that is already there.
 */
export type PartRole = 'intro' | 'listing' | 'panel';

export function partClass(role: PartRole): string {
  return `${styles.part} ${styles[role]}`;
}
