import type { CSSProperties } from 'react';

import { variants, type ImageEntry } from '@/lib/media';

import styles from './MediaFrame.module.css';

interface MediaFrameProps {
  entry: ImageEntry;
  /** Already resolved to a locale. Empty string only for decorative images. */
  alt: string;
  /**
   * Required, deliberately: an omitted `sizes` makes the browser assume 100vw
   * and is the single commonest cause of over-downloading.
   */
  sizes: string;
  /** The one image above the fold on a given page. Everything else stays lazy. */
  priority?: boolean;
  className?: string;
  /** So a caller can set a per-slug view-transition-name (the touch cover morph). */
  style?: CSSProperties;
}

/**
 * The only <picture> in the codebase.
 *
 * It has no <source> children any more. It used to carry two — AVIF and WebP,
 * each with its own srcset — because the build emitted both and the browser had
 * to choose. `format=auto` moves that choice to the edge, which picks from the
 * Accept header and caches per format, so one srcset now says everything two
 * used to.
 *
 * The <picture> itself stays. globals.css gives it `display: block` at element
 * specificity on purpose (see MediaFrame.module.css), and WorkIndexRow depends
 * on being able to beat that from its own module. Replacing it with a bare
 * <img> would quietly move that fight to a different element.
 *
 * It takes a resolved entry rather than an ImageRef so a client component can
 * render one without importing the content bundle.
 */
export function MediaFrame({
  entry,
  alt,
  sizes,
  priority = false,
  className,
  style,
}: MediaFrameProps) {
  const ladder = variants(entry);
  const largest = ladder.at(-1);
  if (largest === undefined) throw new Error(`No variants for "${entry.src}"`);

  return (
    <picture className={[styles.frame, className].filter(Boolean).join(' ')} style={style}>
      {/* width/height give the browser the ratio, so there is no wrapper box
          and no CLS. The CSS does the rest. */}
      <img
        src={largest.src}
        srcSet={ladder.map((variant) => `${variant.src} ${variant.width}w`).join(', ')}
        sizes={sizes}
        width={entry.width}
        height={entry.height}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
      />
    </picture>
  );
}
