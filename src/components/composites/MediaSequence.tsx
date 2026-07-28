import { Reveal } from '@/components/motion/Reveal';
import { Media } from '@/components/primitives/Media';
import type { ImageRef, Locale } from '@/lib/types';

import styles from './MediaSequence.module.css';

interface MediaSequenceProps {
  media: readonly ImageRef[];
  locale: Locale;
  className?: string;
}

/** The media column is 7 of the 12 tracks above --bp-lg, and the whole width below it. */
const SIZES = '(min-width: 1024px) 58vw, 92vw';

export function MediaSequence({ media, locale, className }: MediaSequenceProps) {
  return (
    <div className={[styles.sequence, className].filter(Boolean).join(' ')}>
      {media.map((image, index) =>
        index === 0 ? (
          // Deliberately not wrapped in a Reveal. This is the LCP candidate, and
          // an element that starts at opacity 0 is not painted — the reveal
          // would push the measurement out by the length of its own transition.
          <Media key={image.src} image={image} locale={locale} sizes={SIZES} priority />
        ) : (
          <Reveal key={image.src}>
            <Media image={image} locale={locale} sizes={SIZES} />
          </Reveal>
        ),
      )}
    </div>
  );
}
