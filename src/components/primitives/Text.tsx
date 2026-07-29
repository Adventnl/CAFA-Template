import type { CSSProperties, ElementType, ReactNode } from 'react';

import styles from './Text.module.css';

/** The six roles from docs/DESIGN-SYSTEM.md §3. There is no seventh. */
type TextRole = 'display' | 'title' | 'body' | 'index' | 'meta' | 'label';

interface TextProps {
  role: TextRole;
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** So a caller can give a run a per-slug view-transition-name (a rail number). */
  style?: CSSProperties;
}

export function Text({ role, as: Tag = 'p', children, className, style }: TextProps) {
  return (
    <Tag className={[styles[role], className].filter(Boolean).join(' ')} style={style}>
      {children}
    </Tag>
  );
}
