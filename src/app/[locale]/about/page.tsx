import type { Metadata } from 'next';

import { MentorGrid } from '@/components/composites/MentorGrid';
import { PageHeading } from '@/components/composites/PageHeading';
import { StudioStrip } from '@/components/composites/StudioStrip';
import { partClass } from '@/components/motion/Part';
import { Grid } from '@/components/primitives/Grid';
import { Text } from '@/components/primitives/Text';
import { scenes, sceneAttrs } from '@/lib/choreography';
import { getDictionary, getMentors, getSite, requireLocale } from '@/lib/content';
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
    // Three blocks rather than one grid, because the middle one is not on the
    // grid: the filmstrip runs edge to edge and pins to the viewport, which a
    // child of a max-width, guttered container cannot do. The home page splits
    // the same way and for the same reason.
    <>
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
      </Grid>
      {/* The same photographs the home page carries as a full-bleed column, read
          the other way: a single row travelling across a pinned window. It is
          the page's one place, between what the studio says about itself and who
          is in it. MOTION.md §5.2. */}
      <StudioStrip
        images={getSite().studio}
        locale={locale}
        title={dictionary.about.studioTitle}
        className={styles.studio}
      />
      <Grid>
        <MentorGrid
          mentors={getMentors()}
          locale={locale}
          heading={dictionary.about.mentorsTitle}
          className={styles.mentors}
        />
      </Grid>
    </>
  );
}
