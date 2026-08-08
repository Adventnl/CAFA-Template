import bundle from '@/content/bundle.generated.json';

import { parseMedia } from './content-schema';

/**
 * Where the derivatives come from.
 *
 * There used to be a build step here: sharp walked media-source, wrote five
 * widths in two formats for each of seventy-one photographs, and recorded them
 * in a generated manifest. That worked because the originals were in the
 * repository and the incremental cache was on the same disk as the build.
 * Neither is true any more — the originals are in R2, and a fresh CI container
 * would re-encode every derivative from scratch on every build, which is AVIF
 * at roughly seven hundred images a time.
 *
 * So nothing is derived. Cloudflare transforms the original on delivery and
 * caches the result, `format=auto` picks AVIF or WebP from the Accept header,
 * and this file only has to know the intrinsic size of each original — which
 * the admin measured when it was uploaded, and which the content bundle
 * carries. The aspect box the CLS budget depends on is unchanged.
 */

export interface ImageEntry {
  /** The R2 object key, e.g. "works/edible-house/01.jpg". */
  src: string;
  /** Intrinsic size of the original, for the aspect box. */
  width: number;
  height: number;
}

export interface ImageVariant {
  src: string;
  width: number;
}

/** The same ladder the sharp pipeline emitted, for the same reasons. */
const WIDTHS = [480, 768, 1200, 1800, 2400];

/**
 * Roughly where `webp q78` sat. Transformations are not byte-identical to what
 * sharp produced and are not meant to be; this is the knob if a photograph ever
 * looks softer than the studio wants.
 */
const QUALITY = 78;

/** Checked at the same gate as everything else — a bad number here is CLS. */
const images = parseMedia(bundle.media);

const base = (() => {
  const value: unknown = bundle.mediaBase;
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error('content: bundle.mediaBase — expected a non-empty string');
  }
  return value.replace(/\/$/, '');
})();

/**
 * Throws rather than degrading: a record referencing a photograph the bundle
 * does not describe is a content error, and it should stop the build rather
 * than ship an <img> with no dimensions and a broken URL.
 */
export function getImage(src: string): ImageEntry {
  const entry = images[src];
  if (entry === undefined) {
    throw new Error(
      `No dimensions for "${src}". It is referenced by content but not in the media table.`,
    );
  }
  return { src, ...entry };
}

/**
 * `fit=scale-down` is what stops a 900px original being served at 1200: it
 * never enlarges, so the ladder below matches `targetWidths()` in the pipeline
 * this replaced — every step under the original's own width, then the original.
 */
export function transformUrl(src: string, width: number): string {
  const options = `width=${width},quality=${QUALITY},format=auto,fit=scale-down`;
  return `/cdn-cgi/image/${options}/${base}/${src}`;
}

export function variants(entry: ImageEntry): ImageVariant[] {
  const cap = Math.min(entry.width, WIDTHS[WIDTHS.length - 1] ?? entry.width);
  const steps = [...new Set([...WIDTHS.filter((width) => width < cap), cap])];
  return steps.map((width) => ({ src: transformUrl(entry.src, width), width }));
}
