import { Focus } from '@/components/motion/Focus';
import { Parallax } from '@/components/motion/Parallax';
import { Media } from '@/components/primitives/Media';
import { scenes } from '@/lib/choreography';
import { cx } from '@/lib/class-names';
import type { ImageRef, Locale } from '@/lib/types';

import styles from './Gallery.module.css';

interface GalleryProps {
  images: readonly ImageRef[];
  locale: Locale;
  /**
   * Whether the first plate is the page's LCP image. The page decides, because
   * only the page knows what is above this section — PageSections.leadSection.
   */
  priority?: boolean;
  className?: string;
}

/**
 * Photographs, full bleed, one at a time with a lot of paper between them.
 *
 * The front page's own sequence below the statement is the reason it exists,
 * and it is no longer the only one: a `gallery` section can be put on any page
 * the studio makes, so the component is named for what it renders rather than
 * for the one page that used to hold it.
 *
 * It is not MediaSequence. That one is a column beside a sticky panel and sizes
 * itself to seven of twelve tracks; this one runs edge to edge and is the only
 * thing on screen. They share no layout and would share no props — the third
 * use is what earns an abstraction, and this is the second.
 */
export function Gallery({ images, locale, priority = false, className }: GalleryProps) {
  return (
    <div className={cx(styles.sequence, className)}>
      {images.map((image, at) => (
        // Full-bleed plates take the deepest focus (§6, depth 3). No entrance —
        // they focus as they pass. On the front page none of them is the LCP:
        // the statement above owns the first screen, which
        // PageSections.module.css enforces. On a page the studio began with a
        // gallery the first plate *is* the LCP, which is what `priority` says.
        <Focus key={image.src} depth={scenes.galleryPlate.depth}>
          <Parallax>
            {/* Full bleed at every width, so `sizes` can only be 100vw. */}
            <Media
              image={image}
              locale={locale}
              sizes="100vw"
              priority={priority && at === 0}
              className={styles.plate}
            />
          </Parallax>
        </Focus>
      ))}
    </div>
  );
}
