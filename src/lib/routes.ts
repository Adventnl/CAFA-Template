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

/**
 * The five addresses the site has.
 *
 * One entry per route file, so no path is ever written out anywhere else — the
 * nav, the sitemap, the metadata helper and the work pager all resolve through
 * here. `work` is the one that takes an argument: a work's own page is
 * generated from the registry under a fixed segment, because its address has to
 * stay valid for as long as the work is cited anywhere.
 *
 * The three inner pages are keyed by their `NavPage` name, which is also their
 * path segment — that is what lets `SiteHeader` and `navContext` index this
 * object by a page's own name instead of carrying a second table of segments.
 */
export const routes = {
  home: (l: Locale) => `/${l}`,
  works: (l: Locale) => `/${l}/works`,
  programs: (l: Locale) => `/${l}/programs`,
  about: (l: Locale) => `/${l}/about`,
  work: (l: Locale, slug: string) => `/${l}/works/${slug}`,
} as const;

/**
 * The destinations that are not URLs.
 *
 * Contact is a card pinned over whatever page you are already on, opened by the
 * nav item rather than navigated to. That is still a destination, so it still
 * belongs in the one file that answers "where does a nav item point" — but it is
 * an element id, not a path, and the difference is deliberate rather than an
 * omission.
 *
 * The value is the popover's HTML id, which the trigger button's `popovertarget`
 * and the panel's `id` both have to spell the same way. Written once here for
 * the same reason a view-transition name is written once in tokens.css: two ends
 * of one identity, and nothing should be able to typo them apart.
 */
export const panels = {
  contact: 'contact-note',
} as const;
