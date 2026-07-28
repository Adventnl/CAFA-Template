import type { Metadata } from 'next';

import { PageHeading } from '@/components/composites/PageHeading';
import { Grid } from '@/components/primitives/Grid';
import { getDictionary, requireLocale } from '@/lib/content';
import type { LocaleParams } from '@/lib/routes';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { about } = getDictionary(requireLocale((await params).locale));
  return { title: about.title, description: about.description };
}

export default async function AboutPage({ params }: LocaleParams) {
  const dictionary = getDictionary(requireLocale((await params).locale));

  return (
    <Grid>
      <PageHeading title={dictionary.about.title} />
    </Grid>
  );
}
