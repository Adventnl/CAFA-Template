import Link from 'next/link';

import { Focus } from '@/components/motion/Focus';
import { Parallax } from '@/components/motion/Parallax';
import { itemClass } from '@/components/motion/Part';
import { Media } from '@/components/primitives/Media';
import { Text } from '@/components/primitives/Text';
import { scenes, sceneAttrs } from '@/lib/choreography';
import { cx } from '@/lib/class-names';
import { routes } from '@/lib/routes';
import type { Locale, WorkListing } from '@/lib/types';
import { vtName } from '@/lib/vt-names';

import styles from './WorkGrid.module.css';

interface WorkGridProps {
  /**
   * Published works only. A card is a cover with a name under it, and a private
   * work publishes no cover — it is listed on the works index, where a row can
   * carry a number and a title and nothing else, and left out here rather than
   * given a card-shaped hole. lib/content answers exactly this question.
   */
  works: readonly WorkListing[];
  locale: Locale;
  heading: string;
  className?: string;
}

/**
 * The projects as a grid of covers — the works index's opposite face.
 *
 * The index at /works is a list: a column of numbers and titles, read down, with
 * the photograph arriving only on hover. This is the same registry read the
 * other way round, picture first, and that is why About gets it rather than a
 * second copy of the index. The page says what the studio is and who is in it;
 * the projects are the evidence, and evidence is looked at before it is read.
 *
 * Server-rendered throughout. There is no hover backdrop here and no state to
 * hold — a card is a link — so unlike WorkIndex this ships nothing.
 */
export function WorkGrid({ works, locale, heading, className }: WorkGridProps) {
  return (
    // The `listing` part arrives as a class from the page — taken at the
    // section rather than at the grid, so its own h2 travels with the cards it
    // labels instead of being left on the surface. Which block holds the role
    // is the page's question, not this component's: two elements sharing a
    // view-transition-name abort the transition, and only the page knows what
    // else is on it.
    <section className={cx(styles.section, className)}>
      <Text role="label" as="h2" className={styles.heading}>
        {heading}
      </Text>
      {/* The container, not the viewport, decides how many columns: the grid is
          the same component whether it sits full width or in a narrower one. It
          is also the batch — each card rises in as the grid scrolls in,
          staggered by column. MOTION.md §5.5. */}
      <ul className={styles.grid} {...sceneAttrs(scenes.workCards)}>
        {works.map((work, index) => (
          // Each card is an item: named, so a route change moves it on its own
          // rather than sliding the whole grid as one rectangle, and stepped, so
          // they arrive in sequence. It is the works index's unzip, on a grid —
          // and because the stagger runs in DOM order across three columns, it
          // reads as a diagonal. MOTION.md §3.
          <li
            key={work.slug}
            className={itemClass(index)}
            style={{ viewTransitionName: vtName.item(work.slug) }}
          >
            <Link href={routes.work(locale, work.slug)} className={styles.card}>
              {/* Focus outside, Parallax inside: the cover comes up to size as it
                  crosses the viewport while the picture pans within its frame.
                  Two elements because they are two animations — §5.4 composes by
                  nesting, never by stacking both onto one element. The spacing
                  rides on the outer one so the card's rhythm does not depend on a
                  margin collapsing through a motion wrapper. */}
              <Focus depth={scenes.workCardCover.depth} className={styles.cover}>
                <Parallax>
                  <Media
                    image={work.cover}
                    locale={locale}
                    sizes="(min-width: 768px) 30vw, (min-width: 480px) 45vw, 92vw"
                  />
                </Parallax>
              </Focus>
              <Text role="index" as="h3">
                {work.title[locale]}
              </Text>
              <span className={styles.meta}>
                {work.discipline.map((discipline) => (
                  <Text key={discipline.en} role="meta" as="span">
                    {discipline[locale]}
                  </Text>
                ))}
                <Text role="meta" as="span" className={styles.year}>
                  {work.year}
                </Text>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
