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
export function Gallery({ images, locale, className }: GalleryProps) {
  return (
    <div className={cx(styles.sequence, className)}>
      {images.map((image) => (
        // Full-bleed plates take the deepest focus (§6, depth 3). No entrance —
        // they focus as they pass. None of them is ever the LCP: the front page
        // is the only page with a gallery, and the statement above owns its
        // first screen — which app/[locale]/page.module.css enforces rather
        // than assumes.
        <Focus key={image.src} depth={scenes.galleryPlate.depth}>
          <Parallax>
            {/* Full bleed at every width, so `sizes` can only be 100vw. */}
            <Media
              image={image}
              locale={locale}
              sizes="100vw"
              className={styles.plate}
            />
          </Parallax>
        </Focus>
      ))}
    </div>
  );
}
