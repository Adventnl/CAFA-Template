import type { Metadata } from 'next';

import { PageHeading } from '@/components/composites/PageHeading';
import { WorkIndex } from '@/components/composites/WorkIndex';
import { Grid } from '@/components/primitives/Grid';
import { getDictionary, getIndexCovers, getWorks, requireLocale } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { routes, type LocaleParams } from '@/lib/routes';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const { works } = getDictionary(locale);
  return pageMetadata({
    locale,
    route: routes.works,
    title: works.title,
    description: works.description,
  });
}

export default async function WorksPage({ params }: LocaleParams) {
  const locale = requireLocale((await params).locale);
  const dictionary = getDictionary(locale);

  return (
    <Grid>
      <PageHeading title={dictionary.works.title} />
      <WorkIndex
        locale={locale}
        works={getWorks()}
        covers={getIndexCovers()}
        statusLabels={dictionary.works.status}
        listLabel={dictionary.a11y.worksList}
      />
    </Grid>
  );
}
