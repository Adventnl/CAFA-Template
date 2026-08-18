/**
 * Joining a component's own class with the one its caller passed.
 *
 * `[styles.thing, className].filter(Boolean).join(' ')` was written fourteen
 * times across primitives, motion wrappers and composites — the same line, with
 * the same two failure modes: a `false` from a `&&` reaching the DOM as the
 * string "false", and an absent `className` leaving a trailing space that
 * shows up in every snapshot and every devtools inspection. This is that line,
 * once, with the type saying what may be passed.
 *
 * It is not a `clsx`: no objects, no arrays, no dependency. Conditions are
 * written where they are decided — `active && styles.on` — because a component
 * that has to look up what turns a class on is a component that has hidden it.
 */
export function cx(...names: (string | false | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}
