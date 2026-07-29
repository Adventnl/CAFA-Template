import { ViewTransition, type ReactNode } from 'react';

/**
 * What makes a route change a move rather than a swap. ARCHITECTURE.md §5.4.
 *
 * React starts a browser view transition for any navigation that happens inside
 * one of these, and `default` names the class its pseudo-elements carry, which
 * is how styles/motion.css gets hold of them. Nothing here animates anything:
 * this component's whole job is to say which subtree the navigation is *of*.
 *
 * It is a Server Component, and it has to stay one — it wraps every page, so a
 * 'use client' here would drag the entire route tree into the bundle.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return <ViewTransition default="page">{children}</ViewTransition>;
}
