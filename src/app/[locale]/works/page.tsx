import type { Metadata } from 'next';

import { PageHeading } from '@/components/composites/PageHeading';
import { WorkIndex } from '@/components/composites/WorkIndex';
import { Grid } from '@/components/primitives/Grid';
import {
  getDictionary,
  getIndexCovers,
  getPage,
  getWorkListings,
  requireLocale,
} from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { routes, type LocaleParams } from '@/lib/routes';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const page = getPage('works');
  return pageMetadata({
    locale,
    route: routes.works,
    title: page.title[locale],
    description: page.description[locale],
  });
}

export default async function WorksPage({ params }: LocaleParams) {
  const locale = requireLocale((await params).locale);
  const dictionary = getDictionary(locale);

  return (
    <Grid>
      <PageHeading title={getPage('works').title[locale]} />
      <WorkIndex
        locale={locale}
        works={getWorkListings()}
        covers={getIndexCovers()}
        statusLabels={dictionary.works.status}
        listLabel={dictionary.a11y.worksList}
      />
    </Grid>
  );
}
