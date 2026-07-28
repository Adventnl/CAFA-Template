import type { ElementType, ReactNode } from 'react';

import styles from './Grid.module.css';

interface GridProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

/**
 * The 12-column page grid from DESIGN-SYSTEM.md §5, with the page gutter and
 * the max width. It takes no span props on purpose: a child places itself with
 * `grid-column` in its own CSS module, so no layout decision is ever written as
 * a literal in JSX.
 */
export function Grid({ as: Tag = 'div', children, className }: GridProps) {
  return <Tag className={[styles.grid, className].filter(Boolean).join(' ')}>{children}</Tag>;
}
