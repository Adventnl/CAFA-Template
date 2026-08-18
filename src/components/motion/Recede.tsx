import type { ReactNode } from 'react';

import { cx } from '@/lib/class-names';

import styles from './Recede.module.css';

/**
 * The counterpart to Reveal: what a block does on the way *out*.
 * ARCHITECTURE.md §5.5.
 *
 * As the element leaves the top of the viewport it shrinks slightly and dims —
 * never to nothing — so it reads as receding into the page rather than being
 * cut off by the edge. It is the same figure a navigation makes, which is what
 * ties the scroll and the route change into one vocabulary.
 *
 * Pure CSS, so this is a Server Component and costs no bytes.
 */
export function Recede({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(styles.recede, className)}>{children}</div>;
}
