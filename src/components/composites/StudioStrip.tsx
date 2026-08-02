import { Media } from '@/components/primitives/Media';
import { Text } from '@/components/primitives/Text';
import { scenes, sceneAttrs } from '@/lib/choreography';
import type { ImageRef, Locale } from '@/lib/types';

import styles from './StudioStrip.module.css';

interface StudioStripProps {
  images: readonly ImageRef[];
  locale: Locale;
  title: string;
  className?: string;
}

/**
 * --strip-plate-inline is max(15rem, 40vw), and 600px is exactly where those two
 * cross — so this is that token restated in the one syntax that cannot read it.
 */
const SIZES = '(min-width: 600px) 40vw, 15rem';

/**
 * The studio, sideways. MOTION.md §5.2 and the §5.5 audit's "about — studio
 * filmstrip: pin-scrub + pan".
 *
 * The section holds the screen while the strip travels across it, so vertical
 * scrolling reads the room from left to right. It is the one figure on the site
 * that changes the *axis* of the reading, which is why About gets it: the page
 * is otherwise a column of prose and a grid of faces, and neither of those is a
 * place. A filmstrip is.
 *
 * It is not StudioSequence. That one is the home page's full-bleed vertical
 * column, one photograph at a time with a lot of paper between them; this is a
 * single row read across a pinned window. They share the source images and
 * nothing else — no layout, no props, no motion — and the third use is what
 * earns an abstraction, not the second (CLAUDE.md §5).
 *
 * Everything moving is the pan on one element. No 'use client': the pin, the
 * travel and the fallbacks are all CSS, so this ships nothing.
 */
export function StudioStrip({ images, locale, title, className }: StudioStripProps) {
  return (
    // The section is the track and the window inside it is what sticks. No class
    // of its own, because everything a track has — its height, its timeline —
    // comes from the trigger; the only thing the page has to say about it is the
    // space above it. The window takes exactly one child: the trigger drives
    // every child it has, and only the strip should move.
    <section className={className} {...sceneAttrs(scenes.studioStrip)}>
      <div className={styles.window} data-pinned="">
        <div className={styles.track}>
          {/* First on the strip rather than fixed above it: the label introduces
              the room and then leaves with it, which is what a chapter mark on a
              filmstrip does. It is also this section's heading in the outline. */}
          <Text role="label" as="h2" className={styles.title}>
            {title}
          </Text>
          {images.map((image) => (
            <div key={image.src} className={styles.plate}>
              <Media image={image} locale={locale} sizes={SIZES} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
