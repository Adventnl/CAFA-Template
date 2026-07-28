import { en } from '@/content/dictionaries/en';
import { zh, type Dictionary } from '@/content/dictionaries/zh';
import { mentors } from '@/content/mentors';
import { programs } from '@/content/programs';
import { site } from '@/content/site';
import { works } from '@/content/works';

import { getImage, type ImageEntry } from './image-manifest';
import type { Locale, Mentor, Program, SiteContent, Work } from './types';

/** Re-exported so components can type a dictionary prop without reaching into content/. */
export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { zh, en };

function isLocale(value: string): value is Locale {
  return (site.locales as readonly string[]).includes(value);
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
