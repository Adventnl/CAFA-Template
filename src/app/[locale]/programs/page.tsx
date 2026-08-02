import type { Metadata } from 'next';

import { PageHeading } from '@/components/composites/PageHeading';
import { ProgramList } from '@/components/composites/ProgramList';
import { partClass } from '@/components/motion/Part';
import { Grid } from '@/components/primitives/Grid';
import { Text } from '@/components/primitives/Text';
import { getDictionary, getPrograms, requireLocale } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { routes, type LocaleParams } from '@/lib/routes';

import styles from './page.module.css';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const { programs } = getDictionary(locale);
  return pageMetadata({
    locale,
    route: routes.programs,
    title: programs.title,
    description: programs.description,
  });
}

export default async function ProgramsPage({ params }: LocaleParams) {
  const locale = requireLocale((await params).locale);
  const dictionary = getDictionary(locale);

  return (
    <Grid>
      <PageHeading title={dictionary.programs.title} />
      <Text role="body" className={`${styles.intro} ${partClass('intro')}`}>
        {dictionary.programs.intro}
      </Text>
      <ProgramList programs={getPrograms()} locale={locale} className={styles.list} />
    </Grid>
  );
}
