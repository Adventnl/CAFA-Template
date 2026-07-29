import { Focus } from '@/components/motion/Focus';
import { Parallax } from '@/components/motion/Parallax';
import { Media } from '@/components/primitives/Media';
import { scenes } from '@/lib/choreography';
import type { ImageRef, Locale } from '@/lib/types';
import { vtName } from '@/lib/vt-names';

import styles from './MediaSequence.module.css';

interface MediaSequenceProps {
  /** The work this column belongs to, so its cover can take the per-slug morph
      name that pairs with the index's hover backdrop. */
  slug: string;
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

export function MediaSequence({ slug, cover, media, locale, className }: MediaSequenceProps) {
  return (
    <div className={[styles.sequence, className].filter(Boolean).join(' ')}>
      {/* Deliberately not wrapped in a Focus. This is the LCP candidate, and the
          focus curve would have it dimmed and scaled down wherever it sits at
          load — anything but the centre of its pass. It carries the per-slug
          morph name instead — .hero adds the `cover` class the figure stylesheets
          target — and .hero is where it comes to rest. */}
      <Parallax className={styles.hero} style={{ viewTransitionName: vtName.cover(slug) }}>
        <Media image={cover} locale={locale} sizes={SIZES} priority />
      </Parallax>
      {media.map((image) => (
        // Focus, not Reveal: the plate has no entrance, it focuses as it passes
        // — the drift rides inside it. §6, §5.5 (work detail media: focus + drift).
        <Focus key={image.src} depth={scenes.workMedia.depth}>
          <Parallax>
            <Media image={image} locale={locale} sizes={SIZES} />
          </Parallax>
        </Focus>
      ))}
    </div>
  );
}
