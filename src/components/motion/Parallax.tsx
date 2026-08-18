import type { CSSProperties, ReactNode } from 'react';

import { cx } from '@/lib/class-names';

import styles from './Parallax.module.css';

/**
 * Media that keeps moving after it has arrived. ARCHITECTURE.md §5.5.
 *
 * The child drifts a few percent against the scroll inside a frame that holds
 * still, so the picture reads as sitting behind the page rather than printed on
 * it. Two elements, because the drift has to be clipped: translating the image
 * alone would push it into whatever is below.
 *
 * No 'use client'. The entire behaviour is a scroll-driven animation, which
 * means the browser runs it on the compositor and this ships nothing at all.
 */
export function Parallax({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  /** So the frame can carry a per-slug view-transition-name (the media hero). */
  style?: CSSProperties;
}) {
  return (
    <div className={cx(styles.frame, className)} style={style}>
      <div className={styles.drift}>{children}</div>
    </div>
  );
}
