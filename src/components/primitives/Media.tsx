import { getImageEntry, sourceUrl, type ImageVariant } from '@/lib/image-manifest';
import type { ImageRef, Locale } from '@/lib/types';

import styles from './Media.module.css';

/** The width the fallback <img> src aims at — mid-scale, so no browser is punished. */
const FALLBACK_WIDTH = 1200;

interface MediaProps {
  image: ImageRef;
  /**
   * Required, deliberately. A missing `sizes` makes the browser assume 100vw and
   * over-download at every breakpoint, which is the most common way this pipeline
   * gets wasted.
   */
  sizes: string;
  locale: Locale;
  /** The LCP image on a route, and only that one: eager, high priority. */
  priority?: boolean;
  className?: string;
}

function srcSet(variants: ImageVariant[]): string {
  return variants.map((variant) => `${variant.path} ${variant.width}w`).join(', ');
}

export function Media({ image, sizes, locale, priority = false, className }: MediaProps) {
  const entry = getImageEntry(image.src);

  // The manifest measures the real file; the content record is the fallback contract
  // for an image whose derivatives have not been generated yet.
  const width = entry?.width ?? image.width;
  const height = entry?.height ?? image.height;
  const alt = image.alt === '' ? '' : image.alt[locale];

  const fallback =
    entry?.webp.findLast((variant) => variant.width <= FALLBACK_WIDTH) ??
    entry?.webp.at(0) ??
    null;

  return (
    <div
      className={[styles.frame, className].filter(Boolean).join(' ')}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <picture>
        {entry ? <source sizes={sizes} srcSet={srcSet(entry.avif)} type="image/avif" /> : null}
        {entry ? <source sizes={sizes} srcSet={srcSet(entry.webp)} type="image/webp" /> : null}
        <img
          alt={alt}
          className={styles.image}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : undefined}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          src={fallback?.path ?? sourceUrl(image.src)}
          width={width}
        />
      </picture>
    </div>
  );
}
