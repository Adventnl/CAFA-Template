import { Reveal } from '@/components/motion/Reveal';
import { Media } from '@/components/primitives/Media';
import { Text } from '@/components/primitives/Text';
import type { Locale, Mentor } from '@/lib/types';

import styles from './MentorGrid.module.css';

interface MentorGridProps {
  mentors: readonly Mentor[];
  locale: Locale;
  heading: string;
  className?: string;
}

export function MentorGrid({ mentors, locale, heading, className }: MentorGridProps) {
  return (
    <section className={[styles.section, className].filter(Boolean).join(' ')}>
      <Text role="label" as="h2" className={styles.heading}>
        {heading}
      </Text>
      {/* The container, not the viewport, decides how many columns: the grid is
          the same component whether it sits full width or in a narrower one. */}
      <ul className={styles.grid}>
        {mentors.map((mentor, index) => (
          <li key={mentor.slug}>
            <Reveal step={index}>
              <Media
                image={mentor.portrait}
                locale={locale}
                sizes="(min-width: 768px) 30vw, (min-width: 480px) 45vw, 92vw"
                className={styles.portrait}
              />
              <Text role="index" as="h3">
                {mentor.name[locale]}
              </Text>
              <Text role="meta" className={styles.discipline}>
                {mentor.discipline[locale]}
              </Text>
              <Text role="meta" className={styles.note}>
                {mentor.note[locale]}
              </Text>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
