/**
 * The locales, as data. `Locale` derives from it so the runtime list and the
 * compile-time union cannot drift: adding one is a single edit here.
 */
export const LOCALES = ['zh', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/** Every user-visible string in the content bundle is this shape. Never a bare string. */
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
 * A block on a page, and the unit the studio composes a page out of.
 *
 * **Every kind here is exactly one component, and every component that can
 * stand on a page is exactly one kind.** That correspondence is the whole
 * point: a page is no longer a `.tsx` file that spells out which blocks it has
 * — it is a row in the database with a list of these under it, so adding a
 * block to a page, reordering two, or deleting one is an edit in CAFA-Admin
 * rather than a commit here. Adding a *new kind* is the one thing that is still
 * code, and correctly so: a kind that no component renders is a blank on a page.
 *
 * A discriminated union rather than one interface with eight optional fields,
 * so `kind: 'gallery'` is the compiler's word that `images` is there — and so
 * `components/composites/PageSections` cannot forget a kind: its switch has no
 * default and returns no `undefined`.
 *
 * `text` is the section's own line of copy, and the two kinds that carry one
 * mean different things by it — a front page's statement is a sentence, a
 * grid's heading is a word or two. They share the field because they share the
 * shape; nothing reads one as the other.
 */
export type PageSection =
  /** The page's own title, set as its `h1` on the grid. `PageHeading`. */
  | { kind: 'heading' }
  /** One line, centred, holding the first screen on its own. `Recede`. */
  | { kind: 'statement'; text: LocalisedText }
  /** Prose, one entry per paragraph. */
  | { kind: 'prose'; paragraphs: readonly LocalisedText[] }
  /** Photographs, full bleed, one at a time. `Gallery`. */
  | { kind: 'gallery'; images: readonly ImageRef[] }
  /** Every work as a row of numbers and titles. `WorkIndex`. */
  | { kind: 'works-index' }
  /** The published works as a grid of covers. `WorkGrid`. */
  | { kind: 'works-grid'; text: LocalisedText }
  /** Every programme, one screen at a time. `ProgramList`. */
  | { kind: 'programs' }
  /** The mentors, read across a pinned window. `MentorStrip`. */
  | { kind: 'mentors'; text: LocalisedText };

export type SectionKind = PageSection['kind'];

/**
 * A page of the site.
 *
 * There is one route file for all of them (`app/[locale]/[[...path]]`), so the
 * set of pages the site has is the set of rows the studio has made. Deleting
 * one deletes a URL; adding one adds a URL and, if it carries a `navLabel`, an
 * item in the bar.
 *
 * `slug` is the single path segment under the locale, and the empty string is
 * the front page — `/zh` rather than `/zh/something`. There is exactly one such
 * page, which lib/content-schema checks, because a site with no front page is
 * a 404 at its own address.
 */
export interface Page {
  slug: string;
  /** The document title. Also the `h1` a `heading` section sets. */
  title: LocalisedText;
  /** The meta description. */
  description: LocalisedText;
  /** The word in the nav bar, or null for a page the bar does not carry. */
  navLabel: LocalisedText | null;
  sections: readonly PageSection[];
}

/**
 * One item of the nav bar: a page the studio has asked to be listed there.
 *
 * The bar is not a list of its own any more — it is a projection of the pages,
 * built by lib/content, which is why nothing can put an item in it that leads
 * nowhere or leave a page out of it that asked to be in. The Contact item is
 * not here: it opens a panel over the page you are on rather than leading to
 * one, so it belongs to the chrome and its label is in the dictionary.
 */
export interface NavItem {
  slug: string;
  label: LocalisedText;
}

/**
 * The site itself: the parts of it that are not a page.
 *
 * `locales` and `url` belong to the deployment and are stamped into the bundle
 * by the admin rather than edited in it.
 */
export interface SiteContent {
  name: LocalisedText;
  /** Origin for canonical URLs, hreflang and og:image. Change this on deploy. */
  url: string;
  /** Non-empty, and order matters: the first entry is the default served at `/`. */
  locales: readonly [Locale, ...Locale[]];
  localeNames: Record<Locale, string>;
  contact: {
    email: string;
    wechat: string;
    address: LocalisedText;
    hours: LocalisedText;
  };
}

/**
 * UI copy — the strings that belong to the *interface* rather than to a page.
 * One object per locale, both typed as this, so a key that exists in zh and not
 * in en is a build error rather than a blank on the page.
 *
 * What is not here is as deliberate as what is. A page's title, its heading, its
 * prose and the words over its sections are on the page record, because they
 * belong to a page that can be deleted; these are the words on the chrome that
 * outlives every page — the pager on a work, the labels a screen reader hears,
 * the contact card, the footer. A key here exists because a *component* reads it
 * by name, which is why the set is fixed and the admin only ever edits values.
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
  /** The three words for a work's state, read by the index and by a work page. */
  works: { status: Record<WorkStatus, string> };
  work: {
    index: string;
    status: string;
    year: string;
    discipline: string;
    credits: string;
    previous: string;
    next: string;
  };
  /** No `description`: contact is a card, not a page, so it fills no <meta>. */
  contact: {
    /** The word in the nav bar that opens the card. The one nav label that is
        copy rather than a page, because the card is not a page. */
    nav: string;
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
