import type { Metadata } from 'next';

import { MentorStrip } from '@/components/composites/MentorStrip';
import { PageHeading } from '@/components/composites/PageHeading';
import { ProjectGrid } from '@/components/composites/ProjectGrid';
import { partClass } from '@/components/motion/Part';
import { Grid } from '@/components/primitives/Grid';
import { Text } from '@/components/primitives/Text';
import { scenes, sceneAttrs } from '@/lib/choreography';
import { cx } from '@/lib/class-names';
import { getMentors, getPage, getProjects, requireLocale } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { routes, type LocaleParams } from '@/lib/routes';

import styles from './page.module.css';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const page = getPage('about');
  return pageMetadata({
    locale,
    route: routes.about,
    title: page.title[locale],
    description: page.description[locale],
  });
}

export default async function AboutPage({ params }: LocaleParams) {
  const locale = requireLocale((await params).locale);
  const page = getPage('about');
  const projects = getProjects();

  return (
    // Three blocks rather than one grid, because the middle one is not on the
    // grid: the filmstrip runs edge to edge and pins to the viewport, which a
    // child of a max-width, guttered container cannot do. The home page splits
    // the same way and for the same reason.
    <>
      <Grid>
        <PageHeading title={page.title[locale]} />
        {/* The batch is the honest form of the §5.5 audit's "split by line": a
            browser cannot address a line box from CSS, so the stagger is per
            paragraph, which is the unit the content is actually authored in. */}
        <div className={cx(styles.prose, partClass('intro'))} {...sceneAttrs(scenes.prose)}>
          {page.intro.map((paragraph, at) => (
            <Text key={at} role="body">
              {paragraph[locale]}
            </Text>
          ))}
        </div>
      </Grid>
      {/* The people, read across: a single row of portraits travelling through a
          pinned window, between what the studio says about itself and what it
          has made. MOTION.md §5.2. */}
      <MentorStrip
        mentors={getMentors()}
        locale={locale}
        title={page.mentorsTitle[locale]}
        className={styles.strip}
      />
      {/* The projects, and only if there are any. An empty grid under a heading
          reads as a page that failed to load; leaving the section out entirely
          reads as a page that ends after the people, which is what it does. So
          the heading goes with its content rather than standing over nothing —
          which is also why `projects.length` is checked here, in the page, and
          not inside ProjectGrid: whether a section exists is the page's
          question, and a component asked to render nothing should not have to
          decide it is not wanted (CLAUDE.md §3). */}
      {projects.length > 0 && (
        <Grid>
          <ProjectGrid
            projects={projects}
            locale={locale}
            heading={page.projectsTitle[locale]}
            className={cx(styles.projects, partClass('listing'))}
          />
        </Grid>
      )}
    </>
  );
}
