import type { MetadataRoute } from 'next';

import { getPublishedWorks, getSite } from '@/lib/content';
import { routes } from '@/lib/routes';
import type { Locale } from '@/lib/types';

// Required under `output: export` — these are files on disk, not handlers.
export const dynamic = 'force-static';

/** Every page, in both locales, each carrying its own hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSite();
  const url = (route: (locale: Locale) => string, locale: Locale) =>
    new URL(`${route(locale)}/`, site.url).toString();

  const pages: ((locale: Locale) => string)[] = [
    routes.home,
    routes.works,
    routes.programs,
    routes.about,
    ...getPublishedWorks().map(
      (work) => (locale: Locale) => routes.work(locale, work.slug),
    ),
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
