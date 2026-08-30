import { Parallax } from '@/components/motion/Parallax';
import { itemClass } from '@/components/motion/Part';
import { Media } from '@/components/primitives/Media';
import { Text } from '@/components/primitives/Text';
import { scenes, sceneAttrs } from '@/lib/choreography';
import { cx } from '@/lib/class-names';
import type { Locale, Project } from '@/lib/types';
import { vtName } from '@/lib/vt-names';

import styles from './ProjectGrid.module.css';

interface ProjectGridProps {
  /** May be empty — the page leaves the whole section out rather than pass none. */
  projects: readonly Project[];
  locale: Locale;
  heading: string;
  className?: string;
}

/**
 * The projects, at the foot of About: a picture, a name, and a line or two.
 *
 * **Nothing here is a link, and that is the design rather than an omission.**
 * What this replaced was the works index drawn a second time — a grid of covers
 * that each opened a work — under a heading that called them projects. The
 * heading was the honest part: the studio wanted somewhere to show a piece of
 * work with a sentence about it, and what it got was a second front door to the
 * registry. So a project has no page, no route resolves one, and a card is a
 * figure rather than an anchor. A card that cannot be opened should not have a
 * hover state, a pointer cursor, or the lift that promises one, and it has none
 * of the three.
 *
 * That also decides the markup. A list of links is a `<ul>` of `<li><a>`; a list
 * of captioned pictures is a `<ul>` of `<li><figure>`, and the caption is a real
 * `<figcaption>` rather than a div under an image. The title is an `h3` under
 * the section's own `h2`, so the outline reads the same way the page does.
 *
 * Server-rendered throughout, like the grid before it: there is no state to hold
 * and no handler to bind, so this ships nothing. The whole of the motion is two
 * scroll-driven scenes the browser runs on the compositor.
 */
export function ProjectGrid({ projects, locale, heading, className }: ProjectGridProps) {
  return (
    // The `listing` part arrives as a class from the page rather than being
    // taken here, for the reason WorkGrid gave before it: which block holds the
    // role is the page's question, since two elements sharing a
    // view-transition-name abort the transition and only the page knows what
    // else is on it.
    <section className={cx(styles.section, className)}>
      <Text role="label" as="h2" className={styles.heading}>
        {heading}
      </Text>
      {/* The container decides the columns, not the viewport — so the grid is
          the same component full width or in a narrower one. It is also the
          batch: each card is wiped in as the grid scrolls past, a beat behind
          the last. MOTION.md §5.5. */}
      <ul className={styles.grid} {...sceneAttrs(scenes.projectCards)}>
        {projects.map((project, index) => (
          // Named and stepped, like a programme entry: a route change away from
          // About moves each card on its own rather than sliding the grid as one
          // rectangle. Keyed by slug rather than by position, so a card never
          // pairs with the third thing on some other page and gets morphed into
          // it. MOTION.md §3.
          <li
            key={project.slug}
            className={itemClass(index)}
            style={{ viewTransitionName: vtName.item(project.slug) }}
          >
            <figure className={styles.card}>
              {/* Parallax alone, where a work's cover has Focus wrapped around
                  it. Parallax carries its own view() timeline, so the frame
                  holds still and the picture drifts inside it with no scene
                  attached — depth, without the focus curve's invitation. The
                  comment beside `projectCards` in lib/choreography is where that
                  choice is argued, because the absence is the decision. */}
              <Parallax className={styles.picture}>
                <Media
                  image={project.image}
                  locale={locale}
                  sizes="(min-width: 768px) 30vw, (min-width: 480px) 45vw, 92vw"
                />
              </Parallax>

              <figcaption className={styles.caption}>
                <Text role="index" as="h3">
                  {project.title[locale]}
                </Text>
                <Text role="body" className={styles.summary}>
                  {project.summary[locale]}
                </Text>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
