import { partClass } from '@/components/motion/Part';
import { Text } from '@/components/primitives/Text';
import { scenes, sceneAttrs } from '@/lib/choreography';
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
    // The page's `listing` part: a route change carries this whole block as one
    // thing, so it can arrive after the heading rather than with it. MOTION.md §3.
    <ul className={[styles.list, partClass('listing'), className].filter(Boolean).join(' ')}>
      {programs.map((program) => (
        <li key={program.slug}>
          {/* The scene *is* the entry rather than a wrapper around it: another
              div here would sit between the grid and its two placed children.
              Each entry unmasks as it scrolls in. MOTION.md §5.5. */}
          <div className={styles.entry} {...sceneAttrs(scenes.programmeEntry)}>
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
          </div>
        </li>
      ))}
    </ul>
  );
}
