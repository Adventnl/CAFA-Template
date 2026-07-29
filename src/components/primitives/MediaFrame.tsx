import type { CSSProperties } from 'react';

import type { ImageEntry, ImageVariant } from '@/lib/image-manifest';

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

const srcset = (variants: ImageVariant[]) =>
  variants.map((variant) => `${variant.src} ${variant.width}w`).join(', ');

/**
 * The only <picture> in the codebase. It takes a resolved manifest entry rather
 * than an ImageRef so that a client component can render one without importing
 * the manifest — which would put every derivative URL on the site into the
 * bundle. Media wraps it for the server case.
 */
export function MediaFrame({
  entry,
  alt,
  sizes,
  priority = false,
  className,
  style,
}: MediaFrameProps) {
  const fallback = entry.formats.webp.at(-1);
  if (fallback === undefined) throw new Error('An image entry has no WebP derivatives');

  return (
    <picture className={[styles.frame, className].filter(Boolean).join(' ')} style={style}>
      <source type="image/avif" srcSet={srcset(entry.formats.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcset(entry.formats.webp)} sizes={sizes} />
      {/* width/height give the browser the ratio, so there is no wrapper box
          and no CLS. The CSS does the rest. */}
      <img
        src={fallback.src}
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
