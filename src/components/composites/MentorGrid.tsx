import { Focus } from '@/components/motion/Focus';
import { Parallax } from '@/components/motion/Parallax';
import { itemClass, partClass } from '@/components/motion/Part';
import { Media } from '@/components/primitives/Media';
import { Text } from '@/components/primitives/Text';
import { scenes, sceneAttrs } from '@/lib/choreography';
import { cx } from '@/lib/class-names';
import type { Locale, Mentor } from '@/lib/types';
import { vtName } from '@/lib/vt-names';

import styles from './MentorGrid.module.css';

interface MentorGridProps {
  mentors: readonly Mentor[];
  locale: Locale;
  heading: string;
  className?: string;
}

export function MentorGrid({ mentors, locale, heading, className }: MentorGridProps) {
  return (
    // The `listing` part, taken at the section rather than the grid so its own
    // h2 travels with the cards it labels instead of being left on the surface.
    <section className={cx(styles.section, partClass('listing'), className)}>
      <Text role="label" as="h2" className={styles.heading}>
        {heading}
      </Text>
      {/* The container, not the viewport, decides how many columns: the grid is
          the same component whether it sits full width or in a narrower one. It
          is also the batch — each card rises in as the grid scrolls in,
          staggered by column. MOTION.md §5.5. */}
      <ul className={styles.grid} {...sceneAttrs(scenes.mentors)}>
        {mentors.map((mentor, index) => (
          // Each card is an item: named, so a route change moves it on its own
          // rather than sliding the whole grid as one rectangle, and stepped, so
          // they arrive in sequence. It is the works index's unzip, on a grid —
          // and because the stagger runs in DOM order across three columns, it
          // reads as a diagonal, which is what the §5.5 audit's "staggered by
          // column" was after. MOTION.md §3.
          <li
            key={mentor.slug}
            className={itemClass(index)}
            style={{ viewTransitionName: vtName.item(mentor.slug) }}
          >
            {/* Focus outside, Parallax inside: the portrait comes up to size as
                it crosses the viewport while the picture pans within its frame.
                Two elements because they are two animations — §5.4 composes by
                nesting, never by stacking both onto one element. The spacing
                rides on the outer one so the card's rhythm does not depend on a
                margin collapsing through a motion wrapper. */}
            <Focus depth={scenes.mentorPortrait.depth} className={styles.portrait}>
              <Parallax>
                <Media
                  image={mentor.portrait}
                  locale={locale}
                  sizes="(min-width: 768px) 30vw, (min-width: 480px) 45vw, 92vw"
                />
              </Parallax>
            </Focus>
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
