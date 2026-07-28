import type { ElementType, ReactNode } from 'react';

import styles from './Text.module.css';

/** The six roles from docs/DESIGN-SYSTEM.md §3. There is no seventh. */
export type TextRole = 'display' | 'title' | 'body' | 'index' | 'meta' | 'label';

interface TextProps {
  role: TextRole;
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

export function Text({ role, as: Tag = 'p', children, className }: TextProps) {
  return <Tag className={[styles[role], className].filter(Boolean).join(' ')}>{children}</Tag>;
}
