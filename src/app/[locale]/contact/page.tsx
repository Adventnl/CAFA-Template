import type { Metadata } from 'next';

import { PageHeading } from '@/components/composites/PageHeading';
import { Grid } from '@/components/primitives/Grid';
import { getDictionary, requireLocale } from '@/lib/content';
import type { LocaleParams } from '@/lib/routes';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { contact } = getDictionary(requireLocale((await params).locale));
  return { title: contact.title, description: contact.description };
}

export default async function ContactPage({ params }: LocaleParams) {
  const dictionary = getDictionary(requireLocale((await params).locale));

  return (
    <Grid>
      <PageHeading title={dictionary.contact.title} />
    </Grid>
  );
}
