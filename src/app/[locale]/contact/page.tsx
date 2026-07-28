import type { Metadata } from 'next';

import { ContactBlock } from '@/components/composites/ContactBlock';
import { PageHeading } from '@/components/composites/PageHeading';
import { Grid } from '@/components/primitives/Grid';
import { getDictionary, getSite, requireLocale } from '@/lib/content';
import type { LocaleParams } from '@/lib/routes';

import styles from './page.module.css';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { contact } = getDictionary(requireLocale((await params).locale));
  return { title: contact.title, description: contact.description };
}

export default async function ContactPage({ params }: LocaleParams) {
  const locale = requireLocale((await params).locale);
  const dictionary = getDictionary(locale);

  return (
    <Grid>
      <PageHeading title={dictionary.contact.title} />
      <ContactBlock
        site={getSite()}
        locale={locale}
        labels={dictionary.contact}
        className={styles.block}
      />
    </Grid>
  );
}
