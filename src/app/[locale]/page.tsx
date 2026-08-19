import type { Metadata } from 'next';

import { StudioSequence } from '@/components/composites/StudioSequence';
import { Recede } from '@/components/motion/Recede';
import { JsonLd } from '@/components/seo/JsonLd';
import { Grid } from '@/components/primitives/Grid';
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
      {/* The statement recedes as it leaves the top rather than simply scrolling
          off, which is the same figure a navigation makes. It is the first thing
          on the site that moves, and it sets the vocabulary for the rest.

          Set in `label`, the same role as the nav: the first screen is one line
          of the same small type the bar is set in, centred in the empty page,
          and nothing else. There is no link to the works index here because the
          nav already carries one on every page including this one. */}
      <Recede>
        <Grid className={styles.above}>
          <Text role="label" as="h1" className={styles.statement}>
            {dictionary.home.statement}
          </Text>
        </Grid>
      </Recede>
      {/* Genuinely below the fold — see .above — so these stay lazy and the
          statement is what the page is measured on. */}
      <StudioSequence images={getSite().studio} locale={locale} className={styles.studio} />
    </>
  );
}
