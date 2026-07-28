import type { Locale } from './types';

/** What every page under app/[locale] is handed. */
export interface LocaleParams {
  params: Promise<{ locale: string }>;
}

/**
 * The same page in another locale. This is the only path manipulation in the
 * codebase: LocaleSwitch swaps the first segment and keeps the rest, so it
 * never has to know which routes exist.
 */
export function swapLocale(pathname: string, locale: Locale): string {
  const [, ...rest] = pathname.split('/').filter(Boolean);
  return ['', locale, ...rest].join('/');
}

export const routes = {
  home: (l: Locale) => `/${l}`,
  works: (l: Locale) => `/${l}/works`,
  work: (l: Locale, slug: string) => `/${l}/works/${slug}`,
  programs: (l: Locale) => `/${l}/programs`,
  about: (l: Locale) => `/${l}/about`,
  contact: (l: Locale) => `/${l}/contact`,
} as const;
