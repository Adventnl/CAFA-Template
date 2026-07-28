import Link from 'next/link';

import { Text } from '@/components/primitives/Text';
import { Grid } from '@/components/primitives/Grid';
import { getDictionary, requireLocale } from '@/lib/content';
import { routes, type LocaleParams } from '@/lib/routes';

import styles from './page.module.css';

export default async function HomePage({ params }: LocaleParams) {
  const locale = requireLocale((await params).locale);
  const dictionary = getDictionary(locale);

  return (
    <Grid>
      <Text role="display" as="h1" className={styles.statement}>
        {dictionary.home.statement}
      </Text>
      <Link href={routes.works(locale)} className={styles.link}>
        <Text role="label" as="span">
          {dictionary.home.worksLink}
        </Text>
      </Link>
    </Grid>
  );
}
