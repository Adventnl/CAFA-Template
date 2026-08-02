import type { Metadata } from 'next';

import { MentorGrid } from '@/components/composites/MentorGrid';
import { PageHeading } from '@/components/composites/PageHeading';
import { partClass } from '@/components/motion/Part';
import { Grid } from '@/components/primitives/Grid';
import { Text } from '@/components/primitives/Text';
import { scenes, sceneAttrs } from '@/lib/choreography';
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
      {/* The batch is the honest form of the §5.5 audit's "split by line": a
          browser cannot address a line box from CSS, so the stagger is per
          paragraph, which is the unit the content is actually authored in. */}
      <div className={`${styles.prose} ${partClass('intro')}`} {...sceneAttrs(scenes.prose)}>
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
