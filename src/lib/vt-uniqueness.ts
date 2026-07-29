/**
 * A view-transition-name has to be unique across the document at the instant a
 * transition begins. Two elements carrying the same name make the browser abort
 * the entire transition — a hard cut, with nothing logged. MOTION.md §0.4 asks
 * for an assertion that catches the regression before it ships.
 *
 * This is the assertion. It is called by NavStage immediately before a
 * navigation, walks the live DOM once, and warns on any duplicate. It is a
 * development aid only: the guard below is a literal `process.env.NODE_ENV`
 * compare, which the production bundler statically evaluates to `false` and then
 * tree-shakes the whole body away, so it ships no bytes.
 */
export function assertUniqueVtNames(): void {
  if (process.env.NODE_ENV === 'production') return;

  const seen = new Map<string, Element[]>();
  for (const element of document.querySelectorAll<HTMLElement>('*')) {
    const name = getComputedStyle(element).viewTransitionName;
    if (name === '' || name === 'none') continue;
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
