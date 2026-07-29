import { Parallax } from '@/components/motion/Parallax';
import { Media } from '@/components/primitives/Media';
import { Text } from '@/components/primitives/Text';
import { scenes, sceneAttrs } from '@/lib/choreography';
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
          the same component whether it sits full width or in a narrower one. It
          is also the batch — each card focuses as the grid scrolls in, staggered
          by column. MOTION.md §5.5. */}
      <ul className={styles.grid} {...sceneAttrs(scenes.mentors)}>
        {mentors.map((mentor) => (
          <li key={mentor.slug}>
            <Parallax className={styles.portrait}>
              <Media
                image={mentor.portrait}
                locale={locale}
                sizes="(min-width: 768px) 30vw, (min-width: 480px) 45vw, 92vw"
              />
            </Parallax>
            <Text role="index" as="h3">
              {mentor.name[locale]}
            </Text>
            <Text role="meta" className={styles.discipline}>
              {mentor.discipline[locale]}
            </Text>
            <Text role="meta" className={styles.note}>
              {mentor.note[locale]}
            </Text>
          </li>
        ))}
      </ul>
    </section>
  );
}
