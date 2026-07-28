import manifest from './image-manifest.generated.json';

export interface ImageVariant {
  width: number;
  /** Public path, already absolute from the site root. */
  path: string;
}

export interface ImageEntry {
  /** Measured from the file, after EXIF rotation. Authoritative over the content record. */
  width: number;
  height: number;
  avif: ImageVariant[];
  webp: ImageVariant[];
}

const entries: Record<string, ImageEntry> = manifest;

/**
 * Undefined when the pipeline has not seen this source — a content record can name an
 * image before the file lands. Media falls back to the committed original in that case.
 */
export function getImageEntry(src: string): ImageEntry | undefined {
  return entries[src];
}

/** Public URL of a committed original, i.e. an ImageRef.src resolved against public/. */
export function sourceUrl(src: string): string {
  return `/media/source/${src}`;
}
