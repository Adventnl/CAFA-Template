import enJson from '@/content/dictionaries/en.json';
import zhJson from '@/content/dictionaries/zh.json';
import mentorsJson from '@/content/mentors.json';
import programsJson from '@/content/programs.json';
import siteJson from '@/content/site.json';
import worksJson from '@/content/works.json';

import {
  parseDictionary,
  parseMentors,
  parsePrograms,
  parseSite,
  parseWorks,
} from './content-schema';
import { getImage, type ImageEntry } from './image-manifest';
import { LOCALES, type Dictionary, type Locale, type Mentor, type Program, type SiteContent, type Work } from './types';

/** Re-exported so components can type a dictionary prop without reaching into content/. */
export type { Dictionary };

/**
 * Parsed once, at module scope, so a malformed record fails `next build` rather
 * than a page render. Every route imports this file, so there is no path
 * through the build that skips the check.
 */
const site: SiteContent = parseSite(siteJson);
const works: readonly Work[] = parseWorks(worksJson);
const programs: readonly Program[] = parsePrograms(programsJson);
const mentors: readonly Mentor[] = parseMentors(mentorsJson);

const dictionaries: Record<Locale, Dictionary> = {
  zh: parseDictionary(zhJson, 'zh'),
  en: parseDictionary(enJson, 'en'),
};

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

/** The largest WebP derivative of a work's cover — what og:image points at. */
export function getCoverImage(work: Work): string | undefined {
  return getImage(work.cover.src).formats.webp.at(-1)?.src;
}

/**
 * Cover derivatives for the works the index may show, keyed by slug. A private
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
