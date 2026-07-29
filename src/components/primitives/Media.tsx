import { getImage } from '@/lib/image-manifest';
import type { ImageRef, Locale } from '@/lib/types';

import { MediaFrame } from './MediaFrame';

interface MediaProps {
  image: ImageRef;
  locale: Locale;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** An ImageRef from content/, resolved against the build's image manifest. */
export function Media({ image, locale, sizes, priority, className }: MediaProps) {
  return (
    <MediaFrame
      entry={getImage(image.src)}
      alt={image.alt === '' ? '' : image.alt[locale]}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
