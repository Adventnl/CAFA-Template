import type { MetadataRoute } from 'next';

import { getPublishedWorks, getSite } from '@/lib/content';
import { routes } from '@/lib/routes';
import type { Locale } from '@/lib/types';

// Required under `output: export` — these are files on disk, not handlers.
export const dynamic = 'force-static';

/**
 * Every page, in both locales, each carrying its own hreflang alternates.
 *
 * The four pages are named here because there are four of them and the set is
 * code; what is *not* written here is a path — every one of them resolves
 * through lib/routes, so a segment cannot be spelled one way in the sitemap and
 * another in the nav. The works come from the registry, so a work the studio
 * publishes is in the sitemap the first time the site builds and one it deletes
 * is out of it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSite();
  const url = (route: (locale: Locale) => string, locale: Locale) =>
    new URL(`${route(locale)}/`, site.url).toString();

  const pages: ((locale: Locale) => string)[] = [
    routes.home,
    routes.works,
    routes.programs,
    routes.about,
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
