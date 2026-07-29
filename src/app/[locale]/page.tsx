import type { Metadata } from 'next';
import Link from 'next/link';

import { JsonLd } from '@/components/seo/JsonLd';
import { Grid } from '@/components/primitives/Grid';
import { Media } from '@/components/primitives/Media';
import { Text } from '@/components/primitives/Text';
import { getDictionary, getSite, requireLocale } from '@/lib/content';
import { organisationJsonLd } from '@/lib/json-ld';
import { pageMetadata } from '@/lib/metadata';
import { routes, type LocaleParams } from '@/lib/routes';

import styles from './page.module.css';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const { meta } = getDictionary(locale);
  return {
    ...pageMetadata({
      locale,
      route: routes.home,
      title: meta.title,
      description: meta.description,
    }),
    // Absolute: the layout's template would otherwise set the site name twice.
    title: { absolute: meta.title },
  };
}

export default async function HomePage({ params }: LocaleParams) {
  const locale = requireLocale((await params).locale);
  const dictionary = getDictionary(locale);

  return (
    <>
      <JsonLd data={organisationJsonLd(locale)} />
      <Grid className={styles.above}>
        <Text role="display" as="h1" className={styles.statement}>
          {dictionary.home.statement}
        </Text>
        <Link href={routes.works(locale)} className={styles.link}>
          <Text role="label" as="span">
            {dictionary.home.worksLink}
          </Text>
        </Link>
      </Grid>
      {/* Genuinely below the fold — see .above — so it stays lazy and the
          statement is what the page is measured on. */}
      <Media image={getSite().studio} locale={locale} sizes="100vw" className={styles.studio} />
    </>
  );
}
