import { getImage, type ImageVariant } from '@/lib/image-manifest';
import type { ImageRef, Locale } from '@/lib/types';

import styles from './Media.module.css';

interface MediaProps {
  image: ImageRef;
  locale: Locale;
  /**
   * Required, deliberately: an omitted `sizes` makes the browser assume 100vw
   * and is the single commonest cause of over-downloading.
   */
  sizes: string;
  /** The one image above the fold on a given page. Everything else stays lazy. */
  priority?: boolean;
  className?: string;
}

const srcset = (variants: ImageVariant[]) =>
  variants.map((variant) => `${variant.src} ${variant.width}w`).join(', ');

export function Media({ image, locale, sizes, priority = false, className }: MediaProps) {
  const { width, height, formats } = getImage(image.src);
  const fallback = formats.webp.at(-1);
  if (fallback === undefined) throw new Error(`No derivatives written for "${image.src}"`);

  return (
    <picture className={[styles.media, className].filter(Boolean).join(' ')}>
      <source type="image/avif" srcSet={srcset(formats.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcset(formats.webp)} sizes={sizes} />
      {/* width/height give the browser the ratio, so there is no wrapper box
          and no CLS. The CSS below does the rest. */}
      <img
        src={fallback.src}
        width={width}
        height={height}
        alt={image.alt === '' ? '' : image.alt[locale]}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
      />
    </picture>
  );
}
