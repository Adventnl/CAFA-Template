import { LOCALES, type Locale } from './types';

/** Served at the site root. `app/page.tsx` redirects `/` here. */
export const DEFAULT_LOCALE: Locale = 'zh';

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Route params arrive as `string` — Next's generated types widen them, and a static
 * export only ever produces the two params below. This narrows once, at the page
 * boundary, so nothing downstream has to.
 */
export function resolveLocale(value: string): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** The `generateStaticParams` payload for the `[locale]` segment. */
export function localeParams(): { locale: Locale }[] {
  return LOCALES.map((locale) => ({ locale }));
}
