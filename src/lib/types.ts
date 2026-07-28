/** The two locales the site is built for. `zh` is served at `/`, `en` at `/en`. */
export const LOCALES = ['zh', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

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

export interface Credit {
  role: LocalisedText;
  name: LocalisedText;
}

export interface Work {
  slug: string; // URL segment, kebab-case, stable forever
  index: number; // the ium-style running number shown in the list
  title: LocalisedText;
  status: WorkStatus;
  discipline: LocalisedText[]; // "Architecture", "Spatial Illustration"
  year: number;
  summary: LocalisedText;
  credits: Credit[];
  cover: ImageRef; // shown on hover in the index; also the LCP on detail
  media: ImageRef[]; // the scrolling right column, in order
}

export interface Program {
  slug: string;
  title: LocalisedText;
  duration: LocalisedText;
  format: LocalisedText;
  audience: LocalisedText;
  summary: LocalisedText;
  outcomes: LocalisedText[];
}

export interface Mentor {
  slug: string;
  name: LocalisedText;
  role: LocalisedText;
  institution: LocalisedText;
  bio: LocalisedText;
  portrait: ImageRef;
}
