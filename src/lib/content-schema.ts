/**
 * The gate between the content bundle and the rest of the app.
 *
 * The content is fetched from CAFA-Admin at build time and written to
 * `content/bundle.generated.json` by scripts/fetch-content.mjs. That it comes
 * over the wire rather than out of checked-in files changes nothing about what
 * has to be true of it, and it makes this gate matter more rather than less: it
 * is the only thing standing between a database somebody edited this morning
 * and a page that renders `undefined`.
 *
 * JSON costs the compiler its knowledge of the shape — a parsed field is
 * `string` where the app needs `WorkStatus`, and `string[]` where it needs a
 * non-empty tuple. These functions pay that cost back. They run once, at module
 * scope in lib/content, which means `next build` is where a malformed record is
 * caught, with a path to the offending field instead of a blank on a page.
 * Nothing here is a cast: every narrowing is a check that can fail, and failing
 * stops the build — which leaves the previous deploy serving.
 *
 * Since pages became content, this gate also checks the two rules a page has to
 * satisfy that no database column can express: exactly one front page across
 * the site, and exactly one heading on each page. Both are structural — the
 * first is a 404 at the site's own address, the second is an accessibility
 * defect — and both are cheap to check here, once, before anything renders.
 */
import { HOME_SLUG } from './routes';
import {
  LOCALES,
  type Dictionary,
  type ImageRef,
  type Locale,
  type LocalisedText,
  type Mentor,
  type Page,
  type PageSection,
  type Program,
  type SectionKind,
  type SiteContent,
  type Work,
  type WorkStatus,
} from './types';

function fail(at: string, expected: string): never {
  throw new Error(`content: ${at} — expected ${expected}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function object(value: unknown, at: string): Record<string, unknown> {
  if (!isRecord(value)) fail(at, 'an object');
  return value;
}

function array(value: unknown, at: string): unknown[] {
  if (!Array.isArray(value)) fail(at, 'an array');
  return value;
}

function text(value: unknown, at: string): string {
  if (typeof value !== 'string') fail(at, 'a string');
  return value;
}

/** Copy that reaches the page. Blank is a defect, not an empty state. */
function filled(value: unknown, at: string): string {
  const found = text(value, at);
  if (found.trim() === '') fail(at, 'a non-empty string');
  return found;
}

function whole(value: unknown, at: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) fail(at, 'a whole number');
  return value;
}

/**
 * A hue on the colour circle, or null where there is none to have.
 *
 * Absent and null both read as null, and that is not laxity: a photograph with
 * no chromatic content genuinely has no hue, and neither does one the admin has
 * not measured yet. Both want the same neutral band, so both produce the same
 * value rather than one of them being an error. A hue that is *present and out
 * of range* still fails the build, because that is a bug rather than an absence.
 */
function hue(value: unknown, at: string): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value >= 360) {
    fail(at, 'a hue in [0, 360) or null');
  }
  return value;
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** A slug is part of a URL forever, so it is checked rather than trusted. */
function slug(value: unknown, at: string): string {
  const found = text(value, at);
  if (!SLUG.test(found)) fail(at, 'a kebab-case slug');
  return found;
}

/** The same, plus the empty string — which is the front page's address. */
function pageSlug(value: unknown, at: string): string {
  const found = text(value, at);
  if (found !== HOME_SLUG && !SLUG.test(found)) fail(at, 'a kebab-case slug, or "" for the front page');
  return found;
}

function each<T>(value: unknown, at: string, read: (item: unknown, at: string) => T): T[] {
  return array(value, at).map((item, position) => read(item, `${at}[${position}]`));
}

/** A list the site would render as a hole if it were empty. */
function some<T>(values: T[], at: string, expected: string): T[] {
  if (values.length === 0) fail(at, expected);
  return values;
}

/**
 * Non-empty, as a value the compiler believes. `locales[0]` is read without a
 * guard all over the app, and under `noUncheckedIndexedAccess` that is only
 * sound if the type says so.
 */
function atLeastOne<T>(values: T[], at: string): [T, ...T[]] {
  const [first, ...rest] = values;
  if (first === undefined) fail(at, 'at least one entry');
  return [first, ...rest];
}

/**
 * Both locales, always. Spelled out rather than looped over LOCALES so that
 * adding a locale is a compile error here — the alternative is a site that
 * builds and renders `undefined` in the new language.
 */
function localised(value: unknown, at: string): LocalisedText {
  const record = object(value, at);
  return { zh: filled(record.zh, `${at}.zh`), en: filled(record.en, `${at}.en`) };
}

/**
 * CLAUDE.md §10: alt is required. The only way to have no alt text is to say
 * so, with an empty string, which is how a decorative image is declared.
 */
function image(value: unknown, at: string): ImageRef {
  const record = object(value, at);
  return {
    src: filled(record.src, `${at}.src`),
    alt: record.alt === '' ? '' : localised(record.alt, `${at}.alt`),
  };
}

const STATUSES: readonly WorkStatus[] = ['completed', 'in-progress', 'private'];

function status(value: unknown, at: string): WorkStatus {
  const found = STATUSES.find((known) => known === value);
  if (found === undefined) fail(at, STATUSES.join(' | '));
  return found;
}

function work(value: unknown, at: string): Work {
  const record = object(value, at);
  const state = status(record.status, `${at}.status`);

  /*
   * A private work is listed in the index and has no page, so it publishes no
   * photographs at all. The admin already drops them when it builds a revision
   * — that is where the rule belongs, at the point the data leaves the database
   * — and dropping them again here means the site cannot hand out a cover URL
   * even if a payload arrives carrying one.
   *
   * This is the only place an empty image src is legal, and it is legal because
   * nothing ever renders it: getPublishedWorks excludes these from the routes,
   * and getIndexCovers excludes them from the hover backdrop.
   */
  const withheld = state === 'private';

  return {
    slug: slug(record.slug, `${at}.slug`),
    index: whole(record.index, `${at}.index`),
    title: localised(record.title, `${at}.title`),
    status: state,
    discipline: each(record.discipline, `${at}.discipline`, localised),
    year: whole(record.year, `${at}.year`),
    summary: localised(record.summary, `${at}.summary`),
    credits: each(record.credits, `${at}.credits`, (item, credit) => {
      const entry = object(item, credit);
      return {
        role: localised(entry.role, `${credit}.role`),
        name: localised(entry.name, `${credit}.name`),
      };
    }),
    cover: withheld ? { src: '', alt: '' } : image(record.cover, `${at}.cover`),
    media: withheld ? [] : each(record.media, `${at}.media`, image),
  };
}

/** Slugs are addresses. Two records answering to one is a page that shadows another. */
function unique(values: readonly string[], at: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) fail(`${at} "${value}"`, 'a slug used once');
    seen.add(value);
  }
}

function parseWorks(value: unknown): Work[] {
  const found = each(value, 'works', work);
  unique(
    found.map((entry) => entry.slug),
    'works',
  );
  return found;
}

function parsePrograms(value: unknown): Program[] {
  return each(value, 'programs', (item, at) => {
    const record = object(item, at);
    return {
      slug: slug(record.slug, `${at}.slug`),
      name: localised(record.name, `${at}.name`),
      audience: localised(record.audience, `${at}.audience`),
      duration: localised(record.duration, `${at}.duration`),
      summary: localised(record.summary, `${at}.summary`),
    };
  });
}

function parseMentors(value: unknown): Mentor[] {
  return each(value, 'mentors', (item, at) => {
    const record = object(item, at);
    return {
      slug: slug(record.slug, `${at}.slug`),
      name: localised(record.name, `${at}.name`),
      discipline: localised(record.discipline, `${at}.discipline`),
      note: localised(record.note, `${at}.note`),
      portrait: image(record.portrait, `${at}.portrait`),
    };
  });
}

/**
 * The kinds, listed once so a bad one can be reported with the set it missed.
 * `satisfies` rather than a bare array: a kind added to `PageSection` and
 * forgotten here is a compile error, which is the only way this list stays the
 * same list the union is.
 */
const SECTION_KINDS = [
  'heading',
  'statement',
  'prose',
  'gallery',
  'works-index',
  'works-grid',
  'programs',
  'mentors',
] as const satisfies readonly SectionKind[];

/** The kinds that set a page's `h1`. Exactly one of them per page — see `page`. */
const HEADING_KINDS: readonly SectionKind[] = ['heading', 'statement'];

function section(value: unknown, at: string): PageSection {
  const record = object(value, at);
  const kind = text(record.kind, `${at}.kind`);

  // No `default`, and every branch returns: a kind added to the union without a
  // branch here fails to compile rather than parsing into something unrenderable.
  switch (kind) {
    case 'heading':
      return { kind };
    case 'statement':
      return { kind, text: localised(record.text, `${at}.text`) };
    case 'prose':
      return {
        kind,
        paragraphs: some(
          each(record.paragraphs, `${at}.paragraphs`, localised),
          `${at}.paragraphs`,
          'at least one paragraph',
        ),
      };
    case 'gallery':
      return {
        kind,
        images: some(
          each(record.images, `${at}.images`, image),
          `${at}.images`,
          'at least one photograph',
        ),
      };
    case 'works-index':
      return { kind };
    case 'works-grid':
      return { kind, text: localised(record.text, `${at}.text`) };
    case 'programs':
      return { kind };
    case 'mentors':
      return { kind, text: localised(record.text, `${at}.text`) };
  }

  return fail(`${at}.kind`, SECTION_KINDS.join(' | '));
}

function page(value: unknown, at: string): Page {
  const record = object(value, at);
  const sections = each(record.sections, `${at}.sections`, section);

  /*
   * CLAUDE.md §10: one h1 per page, and every page has one. Two headings is a
   * broken document outline; none is a page a screen reader cannot name. The
   * admin refuses to save either, so this is the second of two gates — and the
   * one that also holds for a revision published before the rule existed.
   */
  const headings = sections.filter((entry) => HEADING_KINDS.includes(entry.kind));
  if (headings.length !== 1) {
    fail(`${at}.sections`, `exactly one ${HEADING_KINDS.join(' or ')} section, found ${headings.length}`);
  }

  return {
    slug: pageSlug(record.slug, `${at}.slug`),
    title: localised(record.title, `${at}.title`),
    description: localised(record.description, `${at}.description`),
    // Absent and null both mean "not in the bar". A label that is *present* is
    // held to the same both-languages rule as every other piece of copy.
    navLabel:
      record.navLabel === undefined || record.navLabel === null
        ? null
        : localised(record.navLabel, `${at}.navLabel`),
    sections,
  };
}

function parsePages(value: unknown): Page[] {
  const found = each(value, 'pages', page);
  unique(
    found.map((entry) => entry.slug),
    'pages',
  );

  const home = found.filter((entry) => entry.slug === HOME_SLUG);
  if (home.length !== 1) {
    fail('pages', `exactly one page with an empty slug — the front page — found ${home.length}`);
  }

  return found;
}

function isLocale(value: string): value is (typeof LOCALES)[number] {
  return LOCALES.some((known) => known === value);
}

function parseSite(value: unknown): SiteContent {
  const record = object(value, 'site');
  const contact = object(record.contact, 'site.contact');
  const localeNames = object(record.localeNames, 'site.localeNames');

  const locales = each(record.locales, 'site.locales', (item, at) => {
    const found = text(item, at);
    if (!isLocale(found)) fail(at, LOCALES.join(' | '));
    return found;
  });

  return {
    name: localised(record.name, 'site.name'),
    url: filled(record.url, 'site.url'),
    locales: atLeastOne(locales, 'site.locales'),
    localeNames: {
      zh: filled(localeNames.zh, 'site.localeNames.zh'),
      en: filled(localeNames.en, 'site.localeNames.en'),
    },
    contact: {
      email: filled(contact.email, 'site.contact.email'),
      wechat: filled(contact.wechat, 'site.contact.wechat'),
      address: localised(contact.address, 'site.contact.address'),
      hours: localised(contact.hours, 'site.contact.hours'),
    },
  };
}

function parseDictionary(value: unknown, locale: string): Dictionary {
  const at = `dictionaries/${locale}`;
  const record = object(value, at);

  /** Every leaf in a dictionary is required copy, so they all read the same way. */
  const group = (key: string) => {
    const nested = object(record[key], `${at}.${key}`);
    return (field: string) => filled(nested[field], `${at}.${key}.${field}`);
  };

  const meta = group('meta');
  const a11y = group('a11y');
  const workStatus = object(object(record.works, `${at}.works`).status, `${at}.works.status`);
  const detail = group('work');
  const contact = group('contact');
  const notFound = group('notFound');
  const footer = group('footer');

  return {
    meta: {
      title: meta('title'),
      titleTemplate: meta('titleTemplate'),
      description: meta('description'),
    },
    a11y: {
      skipToContent: a11y('skipToContent'),
      primaryNav: a11y('primaryNav'),
      localeSwitch: a11y('localeSwitch'),
      worksList: a11y('worksList'),
      worksRail: a11y('worksRail'),
      workPager: a11y('workPager'),
      close: a11y('close'),
    },
    works: {
      status: {
        completed: filled(workStatus.completed, `${at}.works.status.completed`),
        'in-progress': filled(workStatus['in-progress'], `${at}.works.status.in-progress`),
        private: filled(workStatus.private, `${at}.works.status.private`),
      },
    },
    work: {
      index: detail('index'),
      status: detail('status'),
      year: detail('year'),
      discipline: detail('discipline'),
      credits: detail('credits'),
      previous: detail('previous'),
      next: detail('next'),
    },
    contact: {
      nav: contact('nav'),
      title: contact('title'),
      email: contact('email'),
      wechat: contact('wechat'),
      address: contact('address'),
      hours: contact('hours'),
      note: contact('note'),
      from: contact('from'),
      message: contact('message'),
      subject: contact('subject'),
      send: contact('send'),
    },
    notFound: { title: notFound('title'), body: notFound('body'), home: notFound('home') },
    footer: { note: footer('note') },
  };
}

/** What the admin measured about a photograph when it was uploaded. */
export interface MediaFacts {
  /** Intrinsic size of the original, which is what holds the aspect box open. */
  width: number;
  height: number;
  /**
   * The photograph's dominant hue, or null where it has none — a monochrome
   * image, or one the admin has not measured. Only the works index reads it,
   * to tint the band behind the row under the pointer. DESIGN-SYSTEM.md §7.
   */
  tint: number | null;
}

/**
 * What was measured, keyed by R2 object key.
 *
 * These are what hold a slot open before a photograph arrives, so a bad number
 * here is layout shift on the live site. Checking them at the same gate as
 * everything else means a malformed one fails `next build` rather than showing
 * up in a field measurement weeks later.
 */
export function parseMedia(value: unknown): Record<string, MediaFacts> {
  const record = object(value, 'media');
  const parsed: Record<string, MediaFacts> = {};

  for (const [key, entry] of Object.entries(record)) {
    const at = `media["${key}"]`;
    const facts = object(entry, at);
    const width = whole(facts.width, `${at}.width`);
    const height = whole(facts.height, `${at}.height`);
    if (width <= 0 || height <= 0) fail(at, 'positive dimensions');
    parsed[key] = { width, height, tint: hue(facts.tint, `${at}.tint`) };
  }

  return parsed;
}

export interface ContentBundle {
  /** The published revision this build came from. 0 for a draft preview. */
  revision: number;
  site: SiteContent;
  pages: Page[];
  works: Work[];
  programs: Program[];
  mentors: Mentor[];
  dictionaries: Record<Locale, Dictionary>;
}

/**
 * The whole payload, in one gate.
 *
 * Every function this calls can fail, and failing stops `next build` with a
 * path to the offending field — which leaves the previous deploy serving rather
 * than replacing it with a page that renders `undefined`.
 */
export function parseBundle(value: unknown): ContentBundle {
  const record = object(value, 'bundle');
  const dictionaries = object(record.dictionaries, 'bundle.dictionaries');

  return {
    revision: whole(record.revision, 'bundle.revision'),
    site: parseSite(record.site),
    pages: parsePages(record.pages),
    works: parseWorks(record.works),
    programs: parsePrograms(record.programs),
    mentors: parseMentors(record.mentors),
    dictionaries: {
      zh: parseDictionary(dictionaries.zh, 'zh'),
      en: parseDictionary(dictionaries.en, 'en'),
    },
  };
}
