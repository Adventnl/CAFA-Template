import manifest from './image-manifest.generated.json';

export interface ImageVariant {
  /** absolute, site-root-relative URL of a derivative */
  src: string;
  width: number;
}

export interface ImageEntry {
  /** intrinsic size of the source file, for the aspect box */
  width: number;
  height: number;
  /** grouped by format so the generated JSON types itself without a cast */
  formats: { avif: ImageVariant[]; webp: ImageVariant[] };
}

const images: Record<string, ImageEntry> = manifest;

/**
 * Throws rather than degrading: a work referencing an image that was never
 * processed is a content error, and it should stop the build, not ship a
 * broken `<img>`.
 */
export function getImage(src: string): ImageEntry {
  const entry = images[src];
  if (entry === undefined) {
    throw new Error(
      `No derivatives for "${src}". Add the file to public/media/source and run \`npm run prebuild\`.`,
    );
  }
  return entry;
}
