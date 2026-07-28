import type { Metadata } from 'next';

import { PageHeading } from '@/components/composites/PageHeading';
import { Grid } from '@/components/primitives/Grid';
import { getDictionary, requireLocale } from '@/lib/content';
import type { LocaleParams } from '@/lib/routes';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { programs } = getDictionary(requireLocale((await params).locale));
  return { title: programs.title, description: programs.description };
}

export default async function ProgramsPage({ params }: LocaleParams) {
  const dictionary = getDictionary(requireLocale((await params).locale));

  return (
    <Grid>
      <PageHeading title={dictionary.programs.title} />
    </Grid>
  );
}
