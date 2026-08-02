/**
 * A view-transition-name has to be unique across the document at the instant a
 * transition begins. Two elements carrying the same name make the browser abort
 * the entire transition — a hard cut, with nothing logged. MOTION.md §0.4 asks
 * for an assertion that catches the regression before it ships.
 *
 * This is the assertion. NavStage schedules it from the click handler, it walks
 * the live DOM once, and warns on any duplicate. It is a development aid only:
 * the guard below is a literal `process.env.NODE_ENV` compare, which the
 * production bundler statically evaluates to `false` and then tree-shakes the
 * whole body away, so it ships no bytes.
 *
 * It is *scheduled*, never called inline, and that is a performance rule rather
 * than a style choice: `getComputedStyle` on every element in the document is a
 * full forced style recalculation, and run synchronously inside the click
 * handler it lands squarely between the press and the first transition frame —
 * tens of milliseconds of dead air on exactly the interaction the whole motion
 * system is trying to make feel immediate. A timeout hands the click back to the
 * browser first. The audit still sees the outgoing DOM: React has not committed
 * the new route yet when a macrotask queued from the click handler runs.
 */
export function scheduleVtNameAudit(): void {
  if (process.env.NODE_ENV === 'production') return;
  setTimeout(auditVtNames, 0);
}

function auditVtNames(): void {
  const seen = new Map<string, Element[]>();
  for (const element of document.querySelectorAll<HTMLElement>('*')) {
    const name = getComputedStyle(element).viewTransitionName;
    if (name === '' || name === 'none') continue;
    // Only a rendered element is captured, so only a rendered element can
    // collide. The two halves of the cover morph — the row's inline picture and
    // the hover backdrop — deliberately carry one name between them and are
    // told apart by a media query hiding one of the two; counting the hidden one
    // would report a collision on every works index that has ever been hovered.
    // checkVisibility()'s defaults are the right test: display and
    // content-visibility exclude an element from capture, visibility and opacity
    // do not.
    if (!element.checkVisibility()) continue;
    const group = seen.get(name);
    if (group === undefined) seen.set(name, [element]);
    else group.push(element);
  }

  for (const [name, group] of seen) {
    if (group.length > 1) {
      console.warn(
        `[vt] view-transition-name "${name}" is on ${group.length} elements at once. ` +
          `The browser will abort the transition. Elements:`,
        ...group,
      );
    }
  }
}
