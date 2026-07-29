import { Parallax } from '@/components/motion/Parallax';
import { Reveal } from '@/components/motion/Reveal';
import { Media } from '@/components/primitives/Media';
import type { ImageRef, Locale } from '@/lib/types';

import styles from './StudioSequence.module.css';

interface StudioSequenceProps {
  images: readonly ImageRef[];
  locale: Locale;
  className?: string;
}

/**
 * The home page below the fold: the studio, full bleed, one photograph at a
 * time with a lot of paper between them.
 *
 * It is not MediaSequence. That one is a column beside a sticky panel and sizes
 * itself to seven of twelve tracks; this one runs edge to edge and is the only
 * thing on screen. They share no layout and would share no props — the third
 * use is what earns an abstraction, and this is the second.
 */
export function StudioSequence({ images, locale, className }: StudioSequenceProps) {
  return (
    <div className={[styles.sequence, className].filter(Boolean).join(' ')}>
      {images.map((image) => (
        <Reveal key={image.src}>
          <Parallax>
            {/* Full bleed at every width, so `sizes` can only be 100vw. None of
                these is ever the LCP element: the statement above them owns the
                first screen, which is what page.module.css enforces. */}
            <Media image={image} locale={locale} sizes="100vw" className={styles.plate} />
          </Parallax>
        </Reveal>
      ))}
    </div>
  );
}
