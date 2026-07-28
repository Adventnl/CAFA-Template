import { en } from '@/content/dictionaries/en';
import { zh, type Dictionary } from '@/content/dictionaries/zh';
import { mentors } from '@/content/mentors';
import { programs } from '@/content/programs';
import { site, type Site } from '@/content/site';
import { works } from '@/content/works';

import type { Locale, Mentor, Program, Work } from './types';

/**
 * The only door into content/. Pages read through here; components take props.
 * Everything below is pure and side-effect free — the modules it reads are static.
 */

const DICTIONARIES: Record<Locale, Dictionary> = { zh, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export function getSite(): Site {
  return site;
}

/** Display order, newest first. Private works are included — the row is rendered dimmed. */
export function getWorks(): readonly Work[] {
  return works;
}

export function getWork(slug: string): Work | undefined {
  return works.find((work) => work.slug === slug);
}

export function getPrograms(): readonly Program[] {
  return programs;
}

export function getMentors(): readonly Mentor[] {
  return mentors;
}
