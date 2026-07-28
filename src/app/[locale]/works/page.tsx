import type { Metadata } from 'next';

import { PageHeading } from '@/components/composites/PageHeading';
import { Grid } from '@/components/primitives/Grid';
import { getDictionary, requireLocale } from '@/lib/content';
import type { LocaleParams } from '@/lib/routes';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { works } = getDictionary(requireLocale((await params).locale));
  return { title: works.title, description: works.description };
}

export default async function WorksPage({ params }: LocaleParams) {
  const dictionary = getDictionary(requireLocale((await params).locale));

  return (
    <Grid>
      <PageHeading title={dictionary.works.title} />
    </Grid>
  );
}
