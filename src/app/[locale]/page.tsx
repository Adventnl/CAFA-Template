import Link from 'next/link';

import { Grid } from '@/components/primitives/Grid';
import { Media } from '@/components/primitives/Media';
import { Text } from '@/components/primitives/Text';
import { getDictionary, getSite, requireLocale } from '@/lib/content';
import { routes, type LocaleParams } from '@/lib/routes';

import styles from './page.module.css';

export default async function HomePage({ params }: LocaleParams) {
  const locale = requireLocale((await params).locale);
  const dictionary = getDictionary(locale);

  return (
    <>
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
      <Media
        image={getSite().studio}
        locale={locale}
        sizes="100vw"
        className={styles.studio}
      />
    </>
  );
}
