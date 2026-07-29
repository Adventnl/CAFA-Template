import { ViewTransition, type ReactNode } from 'react';

/**
 * What makes a route change a move rather than a swap. ARCHITECTURE.md §5.4.
 *
 * React starts a browser view transition for any navigation that happens inside
 * one of these, and `default` names the view-transition-class its pseudo-elements
 * carry — `stage`, the page surface. Everything with real content (the heading,
 * the metadata, the covers, the pager) carries its own name and is lifted out of
 * that surface, so `stage` is nearly empty and can shift and scale without the
 * stretched-snapshot artifact that naming the whole page produced. MOTION.md §3.
 *
 * The figures that shape a transition live in styles/motion/, keyed off the
 * `data-figure` NavStage writes. Nothing here animates anything: this component's
 * whole job is to say which subtree the navigation is *of*.
 *
 * It is a Server Component, and it has to stay one — it wraps every page, so a
 * 'use client' here would drag the entire route tree into the bundle.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return <ViewTransition default="stage">{children}</ViewTransition>;
}
