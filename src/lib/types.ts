export type Locale = 'zh' | 'en';

/** Every user-visible string in content/ is this shape. Never a bare string. */
export type LocalisedText = Record<Locale, string>;

export interface ImageRef {
  /** path relative to public/media/source, e.g. "works/edible-house/01.jpg" */
  src: string;
  /** REQUIRED. Empty string only for decorative images, and that must be deliberate. */
  alt: LocalisedText | '';
  width: number;
  height: number;
}

export type WorkStatus = 'completed' | 'in-progress' | 'private';

export interface Work {
  slug: string; // URL segment, kebab-case, stable forever
  index: number; // the ium-style running number shown in the list
  title: LocalisedText;
  status: WorkStatus;
  discipline: LocalisedText[]; // "Architecture", "Spatial Illustration"
  year: number;
  summary: LocalisedText;
  credits: { role: LocalisedText; name: LocalisedText }[];
  cover: ImageRef; // shown on hover in the index; also the LCP on detail
  media: ImageRef[]; // the scrolling right column, in order
}
