import { Text } from '@/components/primitives/Text';
import type { Locale, Program } from '@/lib/types';

import styles from './ProgramList.module.css';

interface ProgramListProps {
  programs: readonly Program[];
  locale: Locale;
  className?: string;
}

/**
 * The big.dk gutter-label pattern: the name and its particulars sit small and
 * right-aligned in columns 1–2, the prose runs in 4–9, and a hairline separates
 * each entry. DESIGN-SYSTEM.md §5.
 */
export function ProgramList({ programs, locale, className }: ProgramListProps) {
  return (
    <ul className={[styles.list, className].filter(Boolean).join(' ')}>
      {programs.map((program) => (
        <li key={program.slug} className={styles.entry}>
          <div className={styles.gutter}>
            <Text role="label" as="h2">
              {program.name[locale]}
            </Text>
            <Text role="meta" className={styles.particular}>
              {program.audience[locale]}
            </Text>
            <Text role="meta" className={styles.particular}>
              {program.duration[locale]}
            </Text>
          </div>
          <Text role="body" className={styles.summary}>
            {program.summary[locale]}
          </Text>
        </li>
      ))}
    </ul>
  );
}
