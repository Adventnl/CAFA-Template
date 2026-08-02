'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef } from 'react';

import { durationMs } from '@/lib/css-duration';
import { classifyNavigation, type NavContext, type NavIntent } from '@/lib/nav-intent';
import { scheduleVtNameAudit } from '@/lib/vt-uniqueness';

/**
 * The one place a navigation is given its intent. MOTION.md §2.
 *
 * Mounted once in the locale layout, renders nothing. It intercepts a link
 * click in the capture phase — before Next's router, and so before React starts
 * the view transition — classifies the (from → to) pair into a figure, and
 * writes `data-figure`, `data-dir` and `data-restoring` onto <html>. Every
 * ::view-transition-* rule then reads those attributes; nothing else in the
 * system is JavaScript.
 *
 * It also owns scroll restoration. Next restores scroll after React commits,
 * which is a frame too late for a scroll-driven timeline that resolves at paint
 * — so on `popstate` the document is briefly at scrollY 0 and every below-fold
 * entrance resolves to its start state at once (MOTION.md §0.3). Taking manual
 * control and applying the saved position in a layout effect, before paint,
 * closes that frame.
 */

// A layout effect on the server warns and does nothing; fall back to useEffect
// there. In the browser we need the pre-paint timing, which is the whole point.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Same-origin, unmodified, left-click navigations to a different path only. */
function navigableTarget(event: MouseEvent): URL | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;

  const anchor = (event.target as Element | null)?.closest('a');
  if (anchor === null || anchor === undefined) return null;
  if (anchor.target === '_blank' || anchor.hasAttribute('download')) return null;

  const href = anchor.getAttribute('href');
  if (href === null || href.startsWith('#')) return null;

  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin) return null;
  // An in-page anchor (the skip link, a fragment) is not a route change.
  if (url.pathname === location.pathname && url.search === location.search) return null;
  return url;
}

export function NavStage({ context }: { context: NavContext }) {
  const pathname = usePathname();

  // Scroll position keyed by path. A second visit to the same path shares an
  // entry, which for restoring a scroll offset is an imperceptible imprecision.
  const scrolls = useRef(new Map<string, number>());
  // The path currently on screen — the *from* of the next navigation, and the
  // key the outgoing scroll is saved under. Updated once each change commits.
  const currentPath = useRef(pathname);
  const pendingScrollY = useRef(0);
  const restoringTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mounted = useRef(false);

  useEffect(() => {
    history.scrollRestoration = 'manual';

    function stage(intent: NavIntent, restoring: boolean) {
      const root = document.documentElement;
      root.dataset.figure = intent.figure;
      root.dataset.dir = String(intent.dir);
      if (restoring) root.dataset.restoring = '';
      else delete root.dataset.restoring;
      // Scheduled, not called: it is a whole-document getComputedStyle, and the
      // one place it must not run is between the press and the first frame.
      scheduleVtNameAudit();
    }

    function onClick(event: MouseEvent) {
      const url = navigableTarget(event);
      if (url === null) return;
      stage(classifyNavigation(currentPath.current, url.pathname, false, context), false);
      scrolls.current.set(currentPath.current, window.scrollY);
      pendingScrollY.current = 0; // a forward navigation starts at the top
    }

    function onPopState() {
      const from = currentPath.current;
      const to = location.pathname;
      scrolls.current.set(from, window.scrollY);
      stage(classifyNavigation(from, to, true, context), true);
      pendingScrollY.current = scrolls.current.get(to) ?? 0;
    }

    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPopState);
      clearTimeout(restoringTimer.current);
    };
  }, [context]);

  useIsomorphicLayoutEffect(() => {
    // Skip the first run: mounting is not a navigation, and scrolling to the top
    // then would fight a browser that is restoring a reload's own position.
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    window.scrollTo(0, pendingScrollY.current);
    pendingScrollY.current = 0;
    currentPath.current = pathname;

    // Lift the restoration flag once the transition it suppressed is over, so a
    // later scroll into genuinely new content still gets its entrances. Cleared
    // a scene after the change commits — long enough to cover the restore move.
    const root = document.documentElement;
    if (root.dataset.restoring !== undefined) {
      clearTimeout(restoringTimer.current);
      restoringTimer.current = setTimeout(
        () => delete root.dataset.restoring,
        durationMs('--dur-scene', 700),
      );
    }
  }, [pathname]);

  return null;
}
