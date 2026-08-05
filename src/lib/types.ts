export type Locale = 'zh' | 'en';

/** Every user-visible string in content/ is this shape. Never a bare string. */
type LocalisedText = Record<Locale, string>;

/**
 * A reference to a file under media-source. Intrinsic dimensions are not
 * repeated here: scripts/build-images.mjs measures them and lib/image-manifest.ts
 * hands them to Media, so a content record can never disagree with the file.
 */
export interface ImageRef {
  /** path relative to media-source, e.g. "works/edible-house/01.jpg" */
  src: string;
  /** REQUIRED. Empty string only for decorative images, and that must be deliberate. */
  alt: LocalisedText | '';
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

export interface Program {
  slug: string; // stable key; programmes have no page of their own
  name: LocalisedText;
  audience: LocalisedText;
  duration: LocalisedText;
  summary: LocalisedText;
}

export interface Mentor {
  slug: string;
  name: LocalisedText;
  discipline: LocalisedText;
  note: LocalisedText; // exactly one line
  portrait: ImageRef;
}

/**
 * A nav item is either somewhere to go or something to open where you stand.
 * Contact is the second kind — a card pinned over the current page rather than a
 * route — so `opens` carries the id of the panel it shows (lib/routes `panels`).
 * A union rather than an optional `href`, because "the item without a link" is
 * exactly the sort of implicit rule that stops being true the moment a second
 * panel exists.
 */
type NavItem =
  | { label: LocalisedText; href: (locale: Locale) => string }
  | { label: LocalisedText; opens: string };

export interface SiteContent {
  name: LocalisedText;
  /** Origin for canonical URLs, hreflang and og:image. Change this on deploy. */
  url: string;
  /** Non-empty, and order matters: the first entry is the default served at `/`. */
  locales: readonly [Locale, ...Locale[]];
  localeNames: Record<Locale, string>;
  nav: readonly NavItem[];
  /**
   * The photographs the home page carries below the fold, in order. Non-empty:
   * the first is the one the page is measured on once the statement scrolls off.
   */
  studio: readonly [ImageRef, ...ImageRef[]];
  contact: {
    email: string;
    wechat: string;
    address: LocalisedText;
    hours: LocalisedText;
  };
}
