import type { Metadata } from 'next';

import { MentorGrid } from '@/components/composites/MentorGrid';
import { PageHeading } from '@/components/composites/PageHeading';
import { Grid } from '@/components/primitives/Grid';
import { Text } from '@/components/primitives/Text';
import { getDictionary, getMentors, requireLocale } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { routes, type LocaleParams } from '@/lib/routes';

import styles from './page.module.css';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const { about } = getDictionary(locale);
  return pageMetadata({
    locale,
    route: routes.about,
    title: about.title,
    description: about.description,
  });
}

export default async function AboutPage({ params }: LocaleParams) {
  const locale = requireLocale((await params).locale);
  const dictionary = getDictionary(locale);

  return (
    <Grid>
      <PageHeading title={dictionary.about.title} />
      <div className={styles.prose}>
        {dictionary.about.body.map((paragraph) => (
          <Text key={paragraph} role="body">
            {paragraph}
          </Text>
        ))}
      </div>
      <MentorGrid
        mentors={getMentors()}
        locale={locale}
        heading={dictionary.about.mentorsTitle}
        className={styles.mentors}
      />
    </Grid>
  );
}
