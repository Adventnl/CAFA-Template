import { Text } from '@/components/primitives/Text';

import styles from './PageHeading.module.css';

/**
 * The one h1 a section page gets. It exists so the heading lands on the same
 * grid columns and the same baseline on every page — DESIGN-SYSTEM.md §8 rule 4,
 * consistency of position being what makes the site read as authored.
 */
export function PageHeading({ title }: { title: string }) {
  return (
    <Text role="title" as="h1" className={styles.heading}>
      {title}
    </Text>
  );
}
