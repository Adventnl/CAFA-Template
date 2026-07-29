/**
 * Reads a CSS time token off the document root as a number of milliseconds, so
 * a timer in JS can be paced by the same value the animations are — rather than
 * a literal that would drift out of step with tokens.css (CLAUDE.md §4).
 *
 * Reading a custom property is a style read, not a layout read: it touches no
 * geometry and forces no reflow. On the server there is no computed style, so it
 * returns the fallback, which is only ever the timing of code that runs in the
 * browser anyway.
 */
export function durationMs(token: string, fallback: number): number {
  if (typeof window === 'undefined') return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token);
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) return fallback;
  // A bare number in the token means seconds by CSS rules; "ms" means ms.
  return raw.trim().endsWith('ms') ? parsed : parsed * 1000;
}
