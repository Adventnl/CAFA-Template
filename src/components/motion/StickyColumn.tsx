import type { ReactNode } from 'react';

import { cx } from '@/lib/class-names';

import styles from './StickyColumn.module.css';

/**
 * Pure CSS: `position: sticky` above --bp-lg and nothing at all below it, where
 * the page is one column and the panel sits above the media. No scroll
 * listener, no measurement. ARCHITECTURE.md §5.2.
 */
export function StickyColumn({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(styles.sticky, className)}>{children}</div>;
}
