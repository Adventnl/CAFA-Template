import type { ElementType, ReactNode } from 'react';

import styles from './Grid.module.css';

/**
 * Column ranges as `start/end` line numbers on the 12-column grid. The set is closed:
 * every entry is a placement named in docs/DESIGN-SYSTEM.md §5, and a surface that
 * wants a different one changes the design system first.
 */
export type ColumnSpan =
  | '1/13' // full width
  | '1/8' // home statement
  | '1/5' // work detail — sticky meta column
  | '1/3' // programmes — gutter label
  | '1/2' // works index — number
  | '2/6' // works index — title
  | '4/10' // prose, programme body
  | '6/9' // works index — discipline
  | '6/13' // work detail — media column
  | '11/13'; // works index — year and status

const SPAN_CLASS: Record<ColumnSpan, string | undefined> = {
  '1/13': styles.col1to13,
  '1/8': styles.col1to8,
  '1/5': styles.col1to5,
  '1/3': styles.col1to3,
  '1/2': styles.col1to2,
  '2/6': styles.col2to6,
  '4/10': styles.col4to10,
  '6/9': styles.col6to9,
  '6/13': styles.col6to13,
  '11/13': styles.col11to13,
};

interface GridProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

export function Grid({ children, as: Tag = 'div', className }: GridProps) {
  return <Tag className={[styles.grid, className].filter(Boolean).join(' ')}>{children}</Tag>;
}

interface GridItemProps {
  span: ColumnSpan;
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

export function GridItem({ span, children, as: Tag = 'div', className }: GridItemProps) {
  return (
    <Tag className={[styles.item, SPAN_CLASS[span], className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  );
}
