import type { MetadataRoute } from 'next';

import { getPages, getPublishedWorks, getSite } from '@/lib/content';
import { routes } from '@/lib/routes';
import type { Locale } from '@/lib/types';

// Required under `output: export` — these are files on disk, not handlers.
export const dynamic = 'force-static';

/**
 * Every page, in both locales, each carrying its own hreflang alternates.
 *
 * Read off the content rather than listed here, so a page the studio adds is in
 * the sitemap the first time the site builds and a page it deletes is out of it
 * — which is the same guarantee generateStaticParams gives the routes, from the
 * same source.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSite();
  const url = (route: (locale: Locale) => string, locale: Locale) =>
    new URL(`${route(locale)}/`, site.url).toString();

  const pages: ((locale: Locale) => string)[] = [
    ...getPages().map((page) => (locale: Locale) => routes.page(locale, page.slug)),
    ...getPublishedWorks().map((work) => (locale: Locale) => routes.work(locale, work.slug)),
  ];

  return site.locales.flatMap((locale) =>
    pages.map((route) => ({
      url: url(route, locale),
      alternates: {
        languages: Object.fromEntries(
          site.locales.map((option) => [option, url(route, option)]),
        ),
      },
    })),
  );
}
