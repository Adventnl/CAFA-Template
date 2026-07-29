import { Parallax } from '@/components/motion/Parallax';
import { Reveal } from '@/components/motion/Reveal';
import { Media } from '@/components/primitives/Media';
import type { ImageRef, Locale } from '@/lib/types';

import styles from './MediaSequence.module.css';

interface MediaSequenceProps {
  /**
   * Separate from `media` because it has three jobs the rest do not: it is the
   * LCP element, it is what the works index shows on hover, and it is therefore
   * the half of the shared-element morph that lands here. If the sequence
   * started at media[0] instead, the browser would be moving one rectangle
   * while crossfading two different photographs inside it — which looks like a
   * glitch precisely because it is one.
   */
  cover: ImageRef;
  media: readonly ImageRef[];
  locale: Locale;
  className?: string;
}

/** The media column is 7 of the 12 tracks above --bp-lg, and the whole width below it. */
const SIZES = '(min-width: 1024px) 58vw, 92vw';

export function MediaSequence({ cover, media, locale, className }: MediaSequenceProps) {
  return (
    <div className={[styles.sequence, className].filter(Boolean).join(' ')}>
      {/* Deliberately not wrapped in a Reveal. This is the LCP candidate, and an
          element that starts at opacity 0 is not painted — the reveal would push
          the measurement out by the length of its own transition. It carries the
          shared-element name instead, and .hero is where it comes to rest. */}
      <Parallax className={styles.hero}>
        <Media image={cover} locale={locale} sizes={SIZES} priority />
      </Parallax>
      {media.map((image) => (
        <Reveal key={image.src}>
          <Parallax>
            <Media image={image} locale={locale} sizes={SIZES} />
          </Parallax>
        </Reveal>
      ))}
    </div>
  );
}
