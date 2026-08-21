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
 * The front page's slug.
 *
 * A page is one segment under the locale and the front page is the one with no
 * segment at all, which the empty string is the honest spelling of: it is a
 * page like the others, with sections like the others, that happens to sit at
 * the locale's own address. Named rather than written as `''` at four call
 * sites, so "which page is the front page" is a question with one answer.
 */
export const HOME_SLUG = '';

/**
 * The two addresses the site has.
 *
 * `page` covers every page the studio has made — there is one route file behind
 * it and the slug comes from the content, so adding a page adds a URL without
 * touching this. `work` is the one shape that is not a page record: a work's
 * own page is generated from the works registry, under a fixed segment, because
 * its address has to stay valid for as long as the work is cited anywhere.
 */
export const routes = {
  page: (l: Locale, slug: string) => (slug === HOME_SLUG ? `/${l}` : `/${l}/${slug}`),
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
