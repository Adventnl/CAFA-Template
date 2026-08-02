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
} as const;

/**
 * The destinations that are not URLs.
 *
 * Contact used to be `/{locale}/contact` and is not a page any more: it is a
 * card pinned over whatever page you are already on, opened by the nav item
 * rather than navigated to. That is still a destination, so it still belongs in
 * the one file that answers "where does a nav item point" — but it is an element
 * id, not a path, and the difference is deliberate rather than an omission.
 *
 * The value is the popover's HTML id, which the trigger button's `popovertarget`
 * and the panel's `id` both have to spell the same way. Written once here for
 * the same reason a view-transition name is written once in tokens.css: two ends
 * of one identity, and nothing should be able to typo them apart.
 */
export const panels = {
  contact: 'contact-note',
} as const;
