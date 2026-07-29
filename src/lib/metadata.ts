import type { Metadata } from 'next';

import { getSite } from './content';
import type { Locale } from './types';

interface PageMetadataInput {
  locale: Locale;
  /** The page's entry in lib/routes, so no path is ever written out here. */
  route: (locale: Locale) => string;
  title: string;
  description: string;
  /** Site-root-relative path to an image derivative. */
  image?: string;
}

/**
 * Canonical and hreflang for one page, built from the route function itself so
 * the alternates cannot drift from where the pages actually are.
 *
 * The trailing slash matters: next.config sets trailingSlash, so /zh/works/ is
 * the URL that gets served and /zh/works would be a redirect to it.
 */
export function pageMetadata({
  locale,
  route,
  title,
  description,
  image,
}: PageMetadataInput): Metadata {
  const site = getSite();
  const url = (of: Locale) => new URL(`${route(of)}/`, site.url).toString();

  return {
    title,
    description,
    alternates: {
      canonical: url(locale),
      languages: {
        ...Object.fromEntries(site.locales.map((option) => [option, url(option)])),
        'x-default': url(site.locales[0]),
      },
    },
    openGraph: {
      type: 'website',
      locale,
      siteName: site.name[locale],
      title,
      description,
      url: url(locale),
      images: image === undefined ? undefined : [image],
    },
  };
}
