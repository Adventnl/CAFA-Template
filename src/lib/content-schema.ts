/**
 * The gate between the content bundle and the rest of the app.
 *
 * The content is fetched from CAFA-Admin at build time and written to
 * `content/bundle.generated.json` by scripts/fetch-content.mjs. That it now
 * comes over the wire rather than out of six checked-in files changes nothing
 * about what has to be true of it, and it makes this gate matter more rather
 * than less: it is the only thing standing between a database somebody edited
 * this morning and a page that renders `undefined`.
 *
 * JSON costs the compiler its knowledge of the shape — a parsed field is
 * `string` where the app needs `WorkStatus`, and `string[]` where it needs a
 * non-empty tuple. These functions pay that cost back. They run once, at module
 * scope in lib/content, which means `next build` is where a malformed record is
 * caught, with a path to the offending field instead of a blank on a page.
 * Nothing here is a cast: every narrowing is a check that can fail, and failing
 * stops the build — which leaves the previous deploy serving.
 */
import { panels, routes } from './routes';
import {
  LOCALES,
  type Dictionary,
  type ImageRef,
  type Locale,
  type LocalisedText,
  type Mentor,
  type NavEntry,
  type NavPanel,
  type NavRoute,
  type Program,
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

/** A slug is part of a URL forever, so it is checked rather than trusted. */
function slug(value: unknown, at: string): string {
  const found = text(value, at);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(found)) fail(at, 'a kebab-case slug');
  return found;
}

function each<T>(value: unknown, at: string, read: (item: unknown, at: string) => T): T[] {
  return array(value, at).map((item, position) => read(item, `${at}[${position}]`));
}

/**
 * Non-empty, as a value the compiler believes. `locales[0]` and the first
 * studio plate are read without a guard all over the app, and under
 * `noUncheckedIndexedAccess` that is only sound if the type says so.
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

function parseWorks(value: unknown): Work[] {
  const found = each(value, 'works', work);
  const seen = new Set<string>();
  for (const entry of found) {
    if (seen.has(entry.slug)) fail(`works "${entry.slug}"`, 'a slug used once');
    seen.add(entry.slug);
  }
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

/** Predicates rather than casts: an unknown nav key has to be able to fail. */
function isNavRoute(name: string): name is NavRoute {
  return name !== 'work' && Object.hasOwn(routes, name);
}

function isNavPanel(name: string): name is NavPanel {
  return Object.hasOwn(panels, name);
}

function navEntry(value: unknown, at: string): NavEntry {
  const record = object(value, at);
  const label = localised(record.label, `${at}.label`);

  if (Object.hasOwn(record, 'opens')) {
    const opens = text(record.opens, `${at}.opens`);
    if (!isNavPanel(opens)) fail(`${at}.opens`, `a panel in lib/routes (${Object.keys(panels)})`);
    return { label, opens };
  }

  const route = text(record.route, `${at}.route`);
  if (!isNavRoute(route)) {
    fail(`${at}.route`, `a route in lib/routes (${Object.keys(routes).filter(isNavRoute)})`);
  }
  return { label, route };
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
    nav: each(record.nav, 'site.nav', navEntry),
    studio: atLeastOne(each(record.studio, 'site.studio', image), 'site.studio'),
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
  const home = group('home');
  const works = group('works');
  const workStatus = object(object(record.works, `${at}.works`).status, `${at}.works.status`);
  const detail = group('work');
  const programs = group('programs');
  const about = group('about');
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
    home: { statement: home('statement'), worksLink: home('worksLink') },
    works: {
      title: works('title'),
      description: works('description'),
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
    programs: {
      title: programs('title'),
      description: programs('description'),
      intro: programs('intro'),
    },
    about: {
      title: about('title'),
      description: about('description'),
      body: each(object(record.about, `${at}.about`).body, `${at}.about.body`, filled),
      studioTitle: about('studioTitle'),
      mentorsTitle: about('mentorsTitle'),
    },
    contact: {
      title: contact('title'),
      email: contact('email'),
      wechat: contact('wechat'),
      address: contact('address'),
      hours: contact('hours'),
      note: contact('note'),
    },
    notFound: { title: notFound('title'), body: notFound('body'), home: notFound('home') },
    footer: { note: footer('note') },
  };
}

/**
 * Intrinsic dimensions, keyed by R2 object key.
 *
 * These are what hold a slot open before a photograph arrives, so a bad number
 * here is layout shift on the live site. Checking them at the same gate as
 * everything else means a malformed one fails `next build` rather than showing
 * up in a field measurement weeks later.
 */
export function parseMedia(value: unknown): Record<string, { width: number; height: number }> {
  const record = object(value, 'media');
  const parsed: Record<string, { width: number; height: number }> = {};

  for (const [key, entry] of Object.entries(record)) {
    const at = `media["${key}"]`;
    const size = object(entry, at);
    const width = whole(size.width, `${at}.width`);
    const height = whole(size.height, `${at}.height`);
    if (width <= 0 || height <= 0) fail(at, 'positive dimensions');
    parsed[key] = { width, height };
  }

  return parsed;
}

export interface ContentBundle {
  /** The published revision this build came from. 0 for a draft preview. */
  revision: number;
  site: SiteContent;
  works: Work[];
  programs: Program[];
  mentors: Mentor[];
  dictionaries: Record<Locale, Dictionary>;
}

/**
 * The whole payload, in one gate.
 *
 * Content used to arrive as six imported JSON files and now arrives as one
 * fetched bundle, which changes where it comes from and nothing about what has
 * to be true of it. Every function this calls is the same one that checked the
 * files, so a field the admin gets wrong still fails the build with a path to
 * itself, and the previous deploy stays up.
 */
export function parseBundle(value: unknown): ContentBundle {
  const record = object(value, 'bundle');
  const dictionaries = object(record.dictionaries, 'bundle.dictionaries');

  return {
    revision: whole(record.revision, 'bundle.revision'),
    site: parseSite(record.site),
    works: parseWorks(record.works),
    programs: parsePrograms(record.programs),
    mentors: parseMentors(record.mentors),
    dictionaries: {
      zh: parseDictionary(dictionaries.zh, 'zh'),
      en: parseDictionary(dictionaries.en, 'en'),
    },
  };
}
