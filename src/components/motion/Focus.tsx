import type { ReactNode } from 'react';

import { sceneAttrs, type Depth } from '@/lib/choreography';

/**
 * The focus curve on a media surface. MOTION.md §6.
 *
 * This is what replaces Reveal on media, and the replacement is the point: media
 * stops having an entrance at all. Instead of settling in once and staying, a
 * plate is biggest at the centre of its pass and shrinks away at both edges,
 * symmetric so it looks the same scrolling up or down. There is no start state
 * for a back navigation to catch it in — which is what removes the drop-on-return
 * at the root rather than papering over it (§0.3).
 *
 * It is only the outer, scaling half. The internal pan (Parallax) sits inside it;
 * "focus + drift" composes by nesting, each animating its own element. The scale
 * origin is the element's centre by default, which is exactly where a focus curve
 * wants it, so this needs no styles of its own. Pure CSS underneath, so it is a
 * Server Component and ships nothing.
 */
export function Focus({
  depth,
  className,
  children,
}: {
  depth: Depth;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className} {...sceneAttrs({ kind: 'scrub', effect: 'focus', depth })}>
      {children}
    </div>
  );
}
