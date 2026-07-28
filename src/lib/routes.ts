import type { Locale } from './types';

export const routes = {
  home: (l: Locale) => `/${l}`,
  works: (l: Locale) => `/${l}/works`,
  work: (l: Locale, slug: string) => `/${l}/works/${slug}`,
  programs: (l: Locale) => `/${l}/programs`,
  about: (l: Locale) => `/${l}/about`,
  contact: (l: Locale) => `/${l}/contact`,
} as const;
