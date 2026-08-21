import { getSite } from './content';
import { HOME_SLUG, routes } from './routes';
import type { Locale, Work } from './types';

/**
 * schema.org payloads. Kept here rather than in the pages so no page has to
 * know a vocabulary, and so the URLs come from lib/routes like every other.
 */
export function organisationJsonLd(locale: Locale): object {
  const site = getSite();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name[locale],
    url: new URL(`${routes.page(locale, HOME_SLUG)}/`, site.url).toString(),
    email: site.contact.email,
    address: { '@type': 'PostalAddress', streetAddress: site.contact.address[locale] },
  };
}

export function creativeWorkJsonLd(work: Work, locale: Locale, image: string | undefined): object {
  const site = getSite();
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: work.title[locale],
    description: work.summary[locale],
    dateCreated: String(work.year),
    url: new URL(`${routes.work(locale, work.slug)}/`, site.url).toString(),
    ...(image === undefined ? {} : { image: new URL(image, site.url).toString() }),
    creator: work.credits.map((credit) => ({ '@type': 'Person', name: credit.name[locale] })),
    publisher: { '@type': 'Organization', name: site.name[locale] },
  };
}
