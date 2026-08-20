'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, type CSSProperties } from 'react';

import { cx } from '@/lib/class-names';

import styles from './ScrollTicks.module.css';

/**
 * Where in the page the reader is, drawn as a column of lines in the margin.
 * MOTION.md §5.5.
 *
 * The lines never move. They are a ruler laid over the whole document, evenly
 * spaced and fixed to the viewport; what changes is how far each one extends and
 * how much ink it holds, and both are a function of how near it is to the
 * reader's position. So the column reads as a swell travelling down the margin
 * rather than as a bar filling up — which is the difference between an indicator
 * that says *where you are in the thing* and a progress bar that says *how much
 * is left*.
 *
 * The page's key points — one per programme, marked with `data-stop` on the
 * block itself — are drawn as the ruler's *own* lines resting long, never as
 * marks laid over it. That is the whole of the difference between a rule and a
 * rule with a second thing on top of it: a mark placed at its measured fraction
 * would land wherever the block happened to fall, a hair off the line beside it,
 * and the column would read as two overlapping rulers that don't agree. So
 * measurement decides only *which* line is a key point; the rhythm stays the
 * ruler's throughout, and a key point swells and settles on the same ramp as its
 * neighbours, because it is one of them.
 *
 * Nothing here runs on scroll. Each line is one `scroll()`-timeline animation
 * ranged over the slice of the document it answers to, so the browser drives the
 * whole column on the compositor and this component's only work is arithmetic
 * that happens once, at render. CLAUDE.md §7 rules out a scroll handler for
 * exactly this, and MOTION.md §5.6's order of preference puts the scroll-driven
 * animation above anything we could write.
 *
 * The one thing CSS cannot answer is *where* a key point sits in the document,
 * because that is a measurement — hence the effect below, which takes it once
 * after layout and again whenever the document's height changes. It is off the
 * scroll path entirely: no read of any kind happens while the page is moving.
 *
 * A page with no key points gets no column at all, which is how this stays
 * mounted in the layout while appearing on the programmes index alone. Three
 * decisions rather than three omissions: it is not drawn below --bp-lg, where the
 * gutter it lives in is too narrow to hold it and a phone has its own scrollbar;
 * it is not drawn under `prefers-reduced-motion`, where a thing whose entire
 * content is its motion has nothing left to say; and it is not drawn at the top
 * of a page, because at scroll 0 an indicator of the reader's position is
 * reporting a position they have not taken, and a thing that is simply there
 * when the page arrives reads as furniture rather than as an answer. It fades in
 * over the first --tick-wake-* of travel, which — being one more animation on
 * the same scroll timeline as the lines — is entirely in the stylesheet.
 */

/** How many lines the column is drawn with. */
const LINES = 28;
/** And how many of them either side of the reader are lifted to full length. */
const REACH = 3.5;

/** Stable empty result, so a page without key points never re-renders on one. */
const NONE: readonly number[] = [];

export function ScrollTicks() {
  const [keyLines, setKeyLines] = useState(NONE);
  const pathname = usePathname();

  useEffect(() => {
    function remeasure() {
      const next = measureKeyLines();
      setKeyLines((current) => (matches(current, next) ? current : next));
    }

    // A ResizeObserver measures once on observe, so this is both the first
    // measurement — after layout, which is the earliest one worth taking — and
    // every one after it: a photograph landing, the CJK face swapping in, the
    // window resized. The route is a dependency because two pages can be the
    // same height and have their key points in entirely different places.
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, [pathname]);

  if (keyLines.length === 0) return null;

  const keyed = new Set(keyLines);

  return (
    // Decorative: it says what the scrollbar and the headings already say, and
    // it cannot be reached or operated, so it is hidden from the accessibility
    // tree rather than given a name nobody asked for.
    <div className={styles.ticks} aria-hidden="true">
      {Array.from({ length: LINES }, (_, line) => (
        <span
          key={line}
          className={cx(styles.tick, keyed.has(line) && styles.stop)}
          style={lens(line / (LINES - 1))}
        />
      ))}
    </div>
  );
}

/**
 * The slice of the document one line answers to: its own position on the ruler,
 * give or take the reach. They are percentages of `scroll(root)`, and the two at
 * each end of the column fall outside 0–100% on purpose — a line at the top of
 * the ruler has to already be at full length when the page is at the top, so its
 * range has to begin before the document does.
 */
function lens(at: number): CSSProperties {
  const reach = REACH / (LINES - 1);
  return {
    animationRangeStart: `${percent(at - reach)}%`,
    animationRangeEnd: `${percent(at + reach)}%`,
  };
}

function percent(fraction: number): string {
  return (fraction * 100).toFixed(3);
}

/**
 * Which lines of the ruler stand for a key point.
 *
 * A block's position is taken as the scroll at which it is *centred*, not the
 * scroll at which its top edge arrives: a programme holds the screen for a
 * viewport and a half, and the moment it is being read is the middle of that,
 * not the frame it appeared in. It is measured on the block rather than on its
 * heading because the heading is inside a sticky child — its box is wherever
 * the pin has put it, which is a reading of the scroll position rather than of
 * the layout.
 *
 * That fraction then becomes a line index and stops being a fraction. Nothing
 * downstream sees the measurement, which is what keeps the column one ruler.
 */
function measureKeyLines(): readonly number[] {
  const root = document.documentElement;
  const travel = root.scrollHeight - root.clientHeight;
  if (travel <= 0) return NONE;

  const marks = document.querySelectorAll('main [data-stop]');
  if (marks.length === 0) return NONE;

  const claimed: number[] = [];
  for (const mark of marks) {
    const box = mark.getBoundingClientRect();
    const centred = box.top + window.scrollY + box.height / 2 - root.clientHeight / 2;
    const at = Math.min(Math.max(centred / travel, 0), 1);
    claimed.push(claim(Math.round(at * (LINES - 1)), claimed));
  }
  return claimed.sort((a, b) => a - b);
}

/**
 * The line a key point is drawn on: the one nearest it, or — if that one is
 * already somebody's — the nearest free line, looking down the document first,
 * which is where the later of two colliding blocks actually is. Two blocks
 * landing on one line would otherwise be drawn as a single mark, and a key point
 * that isn't there is a worse error than one drawn a line off.
 */
function claim(nearest: number, claimed: readonly number[]): number {
  for (let step = 0; step < LINES; step += 1) {
    const after = nearest + step;
    const before = nearest - step;
    if (after < LINES && !claimed.includes(after)) return after;
    if (before >= 0 && !claimed.includes(before)) return before;
  }
  // Only reachable with more key points than the ruler has lines, where the
  // column is every-line-a-mark anyway and one more changes nothing.
  return nearest;
}

function matches(current: readonly number[], next: readonly number[]): boolean {
  return current.length === next.length && current.every((at, index) => at === next[index]);
}
