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
 * The roles:
 *
 *   intro    the block that says what the page is — Programmes' lead line,
 *            About's prose, a work's summary.
 *   listing  the page's main body of repeated things — the works index, the
 *            programme list, the mentor grid.
 *
 * They are roles, not pages, and that is the design: Programmes' intro and
 * About's prose share the identity `intro`, so the browser knows they occupy the
 * same slot on the board and a lateral move is an *exchange* in a known position
 * rather than two unrelated fades. Which is why adding a role should be resisted
 * — every role that only one page uses is a part with nothing to pair against,
 * and pairs are where the figures come from.
 *
 * There was a third, `panel`, for a self-contained card that *is* the page, and
 * contact was its only user. Contact is now an overlay pinned over whatever page
 * you are on (components/motion/PinnedNote) rather than a page of its own, so no
 * route change can reach it and the role went with the route — which is the rule
 * in the paragraph above applied to itself.
 *
 * This returns a class rather than rendering a wrapper, which is the same
 * decision `sceneAttrs` took and for the same reason: these pages place their
 * children on the 12-column grid with `grid-column`, and a div inserted between
 * the grid and a placed child silently breaks the placement. The class lands on
 * the element that is already there.
 */
export type PartRole = 'intro' | 'listing';

export function partClass(role: PartRole): string {
  return `${styles.part} ${styles[role]}`;
}

/**
 * And the repeated things *inside* a listing: one programme, one project card.
 *
 * A `listing` on its own is a single sheet, so a figure can only slide it as a
 * block — which is why arriving at Programmes and arriving at About looked like
 * the same animation played twice. Naming the entries lets the list unzip
 * instead: they leave and arrive one after another, which is the move the works
 * index already makes on `enter-work` and the reason that one reads as a place
 * rather than a page.
 *
 * The class carries the stagger, because the figure stylesheets cannot: a
 * ::view-transition-* pseudo-element is selected by name and class and nothing
 * else — there is no :nth-child on the far side of a snapshot. Four steps, then
 * it caps, for the same reason the batch trigger caps at four.
 *
 * The per-key *name* is set separately, inline, from lib/vt-names.ts. Two halves
 * of one identity, split because one of them varies per record and one does not.
 */
const LAST_STEP = 3;

export function itemClass(index: number): string {
  const step = Math.min(Math.max(index, 0), LAST_STEP);
  // The template is not decoration: a CSS module is typed as an index signature,
  // so a computed key is `string | undefined` under noUncheckedIndexedAccess.
  // partClass reads its role the same way and for the same reason.
  return `${styles[`item${step}`]}`;
}
