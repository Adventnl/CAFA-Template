import type { ReactNode } from 'react';

import { Text, type TextRole } from './Text';

import styles from './Mark.module.css';

/**
 * A run of text that takes the highlighter stroke while the control around it is
 * hovered or focused. DESIGN-SYSTEM.md §2, §7.
 *
 * It is a Text, not a wrapper around one: the stroke is drawn behind the *word*,
 * so it has to sit on the element that sets the type. The whole trigger is in the
 * stylesheet and keys off the parent being `:hover`/`:focus-visible`, which is
 * why this takes no state, no prop and no class — put it inside a link or a
 * button and it marks; put it anywhere else and it is a plain run of text.
 *
 * Three uses earned this file: the header nav, the locale switch beside it, and
 * the work pager (CLAUDE.md §5). The pager is the one that does not render this
 * component — its links are two lines and want one dab across both, so the box
 * that takes the stroke is the control itself and it composes the class out of
 * Mark.module.css. Same gesture, same file, one element further out.
 *
 * It is bounded by what those three are — a label that goes somewhere — not by
 * where they sit on the page.
 */
export function Mark({ role, children }: { role: TextRole; children: ReactNode }) {
  return (
    <Text role={role} as="span" className={styles.mark}>
      {children}
    </Text>
  );
}
