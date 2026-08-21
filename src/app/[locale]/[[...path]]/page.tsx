import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageSections, type SectionContent } from '@/components/composites/PageSections';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  getDictionary,
  getIndexCovers,
  getMentors,
  getPage,
  getPages,
  getPrograms,
  getPublishedWorkListings,
  getSite,
  getWorkListings,
  requireLocale,
} from '@/lib/content';
import { organisationJsonLd } from '@/lib/json-ld';
import { pageMetadata } from '@/lib/metadata';
import { HOME_SLUG, routes } from '@/lib/routes';

interface PageParams {
  params: Promise<{ locale: string; path?: string[] }>;
}

/**
 * Every page of the site, from one file.
 *
 * There were four of these — home, works, programmes, about — and each one
 * spelled out the blocks it had. The pages are content now: this route
 * enumerates whatever the studio has published and hands each record to
 * `PageSections`, so adding a page adds a URL and a nav item, deleting one
 * takes both away, and neither is a commit in this repository.
 *
 * An *optional* catch-all, because the front page is a page like the others and
 * its slug is the empty one: `{ path: [] }` exports `/zh`, `{ path: ['works'] }`
 * exports `/zh/works`. A work's own page is not here — it is generated from the
 * works registry under `app/[locale]/works/[slug]`, whose static segment wins
 * over this route's dynamic one, so the two coexist without either knowing
 * about the other.
 */
export function generateStaticParams() {
  return getSite().locales.flatMap((locale) =>
    getPages().map((page) => ({
      locale,
      path: page.slug === HOME_SLUG ? [] : [page.slug],
    })),
  );
}

/** The slug this request is for. One segment, or the front page's empty one. */
async function slugOf(params: PageParams['params']): Promise<string> {
  const { path } = await params;
  return path?.[0] ?? HOME_SLUG;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const slug = await slugOf(params);
  const page = getPage(slug);
  if (page === undefined) return {};

  const metadata = pageMetadata({
    locale,
    route: (of) => routes.page(of, slug),
    title: page.title[locale],
    description: page.description[locale],
  });

  // The front page's title *is* the site's, so letting the layout's template
  // append the site name would set it twice. Every other page is a name inside
  // the site and takes the template.
  return slug === HOME_SLUG
    ? { ...metadata, title: { absolute: page.title[locale] } }
    : metadata;
}

export default async function SitePage({ params }: PageParams) {
  const locale = requireLocale((await params).locale);
  const page = getPage(await slugOf(params));
  if (page === undefined) notFound();

  const dictionary = getDictionary(locale);
  const content: SectionContent = {
    works: getWorkListings(),
    publishedWorks: getPublishedWorkListings(),
    covers: getIndexCovers(),
    programs: getPrograms(),
    mentors: getMentors(),
  };

  return (
    <>
      {/* The organisation is described once, on the front page. Repeating it on
          every page says nothing more and invites a crawler to reconcile four
          copies of one record. */}
      {page.slug === HOME_SLUG && <JsonLd data={organisationJsonLd(locale)} />}
      <PageSections
        sections={page.sections}
        title={page.title[locale]}
        locale={locale}
        dictionary={dictionary}
        content={content}
      />
    </>
  );
}
