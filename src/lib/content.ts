import bundle from '@/content/bundle.generated.json';

import { parseBundle } from './content-schema';
import { getImage, variants, type ImageEntry } from './media';
import type {
  Dictionary,
  Locale,
  Mentor,
  Program,
  SiteContent,
  Work,
  WorkListing,
} from './types';
import { LOCALES } from './types';

/**
 * Parsed once, at module scope, so a malformed record fails `next build` rather
 * than a page render. Every route imports this file, so there is no path
 * through the build that skips the check.
 *
 * The bundle is written by scripts/fetch-content.mjs, which fetches it from the
 * admin before Next starts. Doing it in a prebuild script rather than with a
 * top-level `await` here is deliberate: every function below stays synchronous,
 * so nothing above this file had to change when the content moved into a
 * database, and a failed fetch fails with a plain message instead of an
 * unhandled rejection somewhere inside a server component.
 */
const content = parseBundle(bundle);

const site: SiteContent = content.site;
const works: readonly Work[] = content.works;
const programs: readonly Program[] = content.programs;
const mentors: readonly Mentor[] = content.mentors;
const dictionaries: Record<Locale, Dictionary> = content.dictionaries;

function isLocale(value: string): value is Locale {
  return LOCALES.some((known) => known === value);
}

/**
 * Route params arrive as `string`. Every locale that reaches a page came from
 * generateStaticParams, so an unknown one is a bug in the build rather than a
 * visitor's typo — it throws instead of rendering a 404.
 */
export function requireLocale(value: string): Locale {
  if (!isLocale(value)) throw new Error(`Unknown locale "${value}"`);
  return value;
}

export function getSite(): SiteContent {
  return site;
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function getWorks(): readonly Work[] {
  return works;
}

export function getWork(slug: string): Work | undefined {
  return works.find((work) => work.slug === slug);
}

/**
 * The registry as a listing: every work, narrowed to what a row renders.
 *
 * The index and the rail are client components, so what they are handed is
 * serialised into the page. Handing them whole records would put every work's
 * summary, credits and media list into the payload of every page that shows a
 * list of works — see WorkListing. Projected once here, at module scope,
 * because the same array serves both.
 */
const listings: readonly WorkListing[] = works.map(
  ({ slug, index, title, status, discipline, year, cover }) => ({
    slug,
    index,
    title,
    status,
    discipline,
    year,
    cover,
  }),
);

export function getWorkListings(): readonly WorkListing[] {
  return listings;
}

/** The works that have a page of their own. A private work is listed, not opened. */
export function getPublishedWorks(): readonly Work[] {
  return works.filter((work) => work.status !== 'private');
}

/**
 * Neighbours in registry order, which is the editorial sequence rather than
 * anything derived from year. The ends do not wrap: the first work has no
 * previous, and saying so is more honest than looping back to the last.
 */
export function getWorkNeighbours(slug: string): { previous: Work | null; next: Work | null } {
  const published = getPublishedWorks();
  const at = published.findIndex((work) => work.slug === slug);
  if (at === -1) return { previous: null, next: null };
  return { previous: published[at - 1] ?? null, next: published[at + 1] ?? null };
}

/**
 * The largest derivative of a work's cover — what og:image points at. A private
 * work publishes no cover, so it has none, which is why this can return
 * undefined and the metadata helper treats that as "no image".
 */
export function getCoverImage(work: Work): string | undefined {
  if (work.cover.src === '') return undefined;
  return variants(getImage(work.cover.src)).at(-1)?.src;
}

/**
 * Cover dimensions for the works the index may show, keyed by slug. A private
 * work is absent: it publishes no cover, so no URL for one is ever handed to
 * the browser.
 */
export function getIndexCovers(): Record<string, ImageEntry> {
  return Object.fromEntries(
    works
      .filter((work) => work.status !== 'private')
      .map((work) => [work.slug, getImage(work.cover.src)]),
  );
}

export function getPrograms(): readonly Program[] {
  return programs;
}

export function getMentors(): readonly Mentor[] {
  return mentors;
}
