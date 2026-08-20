import type { panels, routes } from './routes';

/**
 * The locales, as data. `Locale` derives from it so the runtime list and the
 * compile-time union cannot drift: adding one is a single edit here.
 */
export const LOCALES = ['zh', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/** Every user-visible string in content/ is this shape. Never a bare string. */
export type LocalisedText = Record<Locale, string>;

/**
 * A reference to a photograph in the bucket. Intrinsic dimensions are not
 * repeated here: the admin measures them when the file is uploaded and the
 * content bundle carries them, so a content record can never disagree with the
 * file. lib/media.ts is what hands them to Media.
 */
export interface ImageRef {
  /** The R2 object key, e.g. "works/edible-house/01.jpg" */
  src: string;
  /**
   * REQUIRED. Empty string only for decorative images, and that must be
   * deliberate. `src` is empty only for a private work, whose cover the admin
   * withholds — see parseWorks.
   */
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

/**
 * What a listing row needs, and nothing else: the works index and the rail both
 * render exactly these fields.
 *
 * It exists because both of those are client components, so every field handed
 * to them is serialised into the page's flight payload whether it is read or
 * not. The whole registry is ~17 KB of JSON, most of it summaries, credits and
 * media arrays that a row never shows — and a work's detail page would carry
 * every *other* work's prose for the sake of a column of numbers. A `Pick`
 * rather than a second hand-written interface, so a field renamed on `Work`
 * cannot quietly stop being sent.
 */
export type WorkListing = Pick<
  Work,
  'slug' | 'index' | 'title' | 'status' | 'discipline' | 'year' | 'cover'
>;

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
 * The nav targets, derived from the two files that own them rather than spelled
 * out again here. `work` is excluded because a detail page needs a slug, so it
 * can never be a bar item.
 */
export type NavRoute = Exclude<keyof typeof routes, 'work'>;
export type NavPanel = keyof typeof panels;

/**
 * A nav item is either somewhere to go or something to open where you stand.
 * Contact is the second kind — a card pinned over the current page rather than a
 * route — so `opens` names the panel it shows (lib/routes `panels`).
 * A union rather than an optional `route`, because "the item without a link" is
 * exactly the sort of implicit rule that stops being true the moment a second
 * panel exists.
 *
 * Both sides carry a *key*, not a URL: content says where an item points, and
 * lib/routes stays the only place that knows what that address actually is.
 */
export type NavEntry =
  | { label: LocalisedText; route: NavRoute }
  | { label: LocalisedText; opens: NavPanel };

export interface SiteContent {
  name: LocalisedText;
  /** Origin for canonical URLs, hreflang and og:image. Change this on deploy. */
  url: string;
  /** Non-empty, and order matters: the first entry is the default served at `/`. */
  locales: readonly [Locale, ...Locale[]];
  localeNames: Record<Locale, string>;
  nav: readonly NavEntry[];
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

/**
 * UI copy — the strings that belong to the interface rather than to a work or a
 * programme. One object per locale, both typed as this, so a key that exists in
 * zh and not in en is a build error rather than a blank on the page.
 *
 * Written out rather than inferred from the zh file: this is the contract an
 * editor outside the repo writes against, and a contract nobody can read is
 * not one.
 */
export interface Dictionary {
  meta: { title: string; titleTemplate: string; description: string };
  a11y: {
    skipToContent: string;
    primaryNav: string;
    localeSwitch: string;
    worksList: string;
    worksRail: string;
    workPager: string;
    /** The close mark on the contact card is drawn, so this is its only name. */
    close: string;
  };
  home: { statement: string };
  works: { title: string; description: string; status: Record<WorkStatus, string> };
  work: {
    index: string;
    status: string;
    year: string;
    discipline: string;
    credits: string;
    previous: string;
    next: string;
  };
  programs: { title: string; description: string; intro: string };
  about: {
    title: string;
    description: string;
    body: string[];
    mentorsTitle: string;
    worksTitle: string;
  };
  /** No `description`: contact is a card, not a page, so it fills no <meta>. */
  contact: {
    title: string;
    email: string;
    wechat: string;
    address: string;
    hours: string;
    note: string;
    /** The message form. `from` and `message` name the two fields; `subject` is
        the line the reader's mail client opens with, so it is copy too. */
    from: string;
    message: string;
    subject: string;
    send: string;
  };
  notFound: { title: string; body: string; home: string };
  footer: { note: string };
}
