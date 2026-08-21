import type { ReactNode } from 'react';

import { partClass } from '@/components/motion/Part';
import { Recede } from '@/components/motion/Recede';
import { Grid } from '@/components/primitives/Grid';
import { Text } from '@/components/primitives/Text';
import { scenes, sceneAttrs } from '@/lib/choreography';
import { cx } from '@/lib/class-names';
import type { ImageEntry } from '@/lib/media';
import type {
  Dictionary,
  Locale,
  Mentor,
  PageSection,
  Program,
  SectionKind,
  WorkListing,
} from '@/lib/types';

import { Gallery } from './Gallery';
import { MentorStrip } from './MentorStrip';
import { PageHeading } from './PageHeading';
import { ProgramList } from './ProgramList';
import { WorkGrid } from './WorkGrid';
import { WorkIndex } from './WorkIndex';
import styles from './PageSections.module.css';

/**
 * The collections a section may draw on.
 *
 * A section names a collection rather than carrying one — a `programs` section
 * shows the programmes, whichever ones exist this morning — so the page route
 * resolves all of them once from lib/content and hands them over. Composites
 * never read content themselves (CLAUDE.md §3), and a server component pays
 * nothing for an array it does not render: only the two client components below
 * serialise what they are given, and they are only mounted by their own kinds.
 */
export interface SectionContent {
  /** Every work, private ones included: a row can carry one, a card cannot. */
  works: readonly WorkListing[];
  publishedWorks: readonly WorkListing[];
  covers: Record<string, ImageEntry>;
  programs: readonly Program[];
  mentors: readonly Mentor[];
}

interface PageSectionsProps {
  sections: readonly PageSection[];
  /** The page's own title, which is what a `heading` section sets as the h1. */
  title: string;
  locale: Locale;
  dictionary: Dictionary;
  content: SectionContent;
}

/**
 * A page, assembled from its record. **This is the only page body in the app.**
 *
 * There used to be four route files — home, works, programmes, about — each
 * spelling out which blocks it had and in what order. That made the *set* of
 * pages a fact about this repository: adding one was a commit, deleting one was
 * a commit, and moving the mentors above the prose was a commit. The pages are
 * content now, so this is where a list of section records becomes a page, and
 * `app/[locale]/[[...path]]` is the single route that renders whatever the
 * studio has made.
 *
 * The switch has no `default` and every branch returns, so a kind added to
 * `PageSection` without a block here is a TypeScript error rather than a gap on
 * a page. That is the correspondence the whole design rests on: one kind, one
 * component, no page that can ask for something nothing draws.
 */
export function PageSections({
  sections,
  title,
  locale,
  dictionary,
  content,
}: PageSectionsProps) {
  /*
   * The two view-transition roles a page can hand out, and which section gets
   * them. MOTION.md §3: a name has to be unique in the document at the instant
   * a transition begins, and two elements sharing one make the browser abort
   * the transition outright — so with sections arranged by an editor rather
   * than by a route file, "which block is the intro" is a question that has to
   * be answered here, once, rather than by each composite claiming a role for
   * itself. The first eligible section takes the role and the rest go without,
   * which is also the honest reading: a page's intro is its first block of
   * prose, and its listing is the first list on it.
   */
  const intro = sections.findIndex((section) => section.kind === 'prose');
  const listing = sections.findIndex((section) => LISTING_KINDS.includes(section.kind));

  return (
    <>
      {sections.map((section, at) => (
        <Section
          // Sections have no id of their own: their order is their identity, and
          // the kind is in the key so that swapping two of different kinds
          // remounts rather than mutates.
          key={`${section.kind}-${at}`}
          section={section}
          title={title}
          locale={locale}
          dictionary={dictionary}
          content={content}
          role={at === intro ? 'intro' : at === listing ? 'listing' : null}
        />
      ))}
    </>
  );
}

/**
 * The kinds that can be a page's `listing` part.
 *
 * The works index is not among them, and that is not an oversight: its list
 * already carries the `rail` name, which is what makes it compress into a work
 * page's number column, and a second name on the same figure is a different
 * transition rather than a richer one.
 */
const LISTING_KINDS: readonly SectionKind[] = ['works-grid', 'programs'];

interface SectionProps extends Omit<PageSectionsProps, 'sections'> {
  section: PageSection;
  /** The view-transition part this section carries, if the page gave it one. */
  role: 'intro' | 'listing' | null;
}

function Section({ section, title, locale, dictionary, content, role }: SectionProps): ReactNode {
  // Every section is separated from the last by one token — the one
  // DESIGN-SYSTEM.md §4 reserves for exactly this — so the rhythm of a page is
  // a property of the page rather than of whichever blocks it happens to have.
  //
  // The *part* class does not go here. A view-transition-name has to land on
  // the element a figure should actually move — the prose column, the grid —
  // and not on the full-width container around it, or the browser animates a
  // box the reader never sees the edges of.
  const outer = styles.section;
  const part = role === null ? undefined : partClass(role);

  switch (section.kind) {
    case 'heading':
      return (
        <Grid className={cx(outer, styles.heading)}>
          <PageHeading title={title} />
        </Grid>
      );

    case 'statement':
      // The one block that recedes as it leaves the top rather than simply
      // scrolling off, which is the same figure a navigation makes. It is the
      // first thing on the site that moves, and it sets the vocabulary for the
      // rest. Set in `label`, the same role as the nav.
      return (
        <Recede className={outer}>
          <Grid className={styles.above}>
            <Text role="label" as="h1" className={styles.statement}>
              {section.text[locale]}
            </Text>
          </Grid>
        </Recede>
      );

    case 'prose':
      return (
        <Grid className={outer}>
          {/* The batch is the honest form of "split by line": a browser cannot
              address a line box from CSS, so the stagger is per paragraph,
              which is the unit the content is actually authored in. */}
          <div className={cx(styles.prose, part)} {...sceneAttrs(scenes.prose)}>
            {section.paragraphs.map((paragraph, at) => (
              // Position is a paragraph's only identity: it has no key of its
              // own, and two of them are allowed to read the same.
              <Text key={at} role="body">
                {paragraph[locale]}
              </Text>
            ))}
          </div>
        </Grid>
      );

    case 'gallery':
      // Outside a Grid, so the plates run edge to edge.
      return <Gallery images={section.images} locale={locale} className={outer} />;

    case 'works-index':
      return (
        <Grid className={outer}>
          <WorkIndex
            locale={locale}
            works={content.works}
            covers={content.covers}
            statusLabels={dictionary.works.status}
            listLabel={dictionary.a11y.worksList}
          />
        </Grid>
      );

    case 'works-grid':
      return (
        <Grid className={outer}>
          <WorkGrid
            works={content.publishedWorks}
            locale={locale}
            heading={section.text[locale]}
            className={cx(styles.full, part)}
          />
        </Grid>
      );

    case 'programs':
      return (
        <Grid className={outer}>
          <ProgramList
            programs={content.programs}
            locale={locale}
            className={cx(styles.full, part)}
          />
        </Grid>
      );

    case 'mentors':
      // Outside a Grid too: the strip runs edge to edge and pins to the
      // viewport, which a child of a max-width, guttered container cannot do.
      return (
        <MentorStrip
          mentors={content.mentors}
          locale={locale}
          title={section.text[locale]}
          className={outer}
        />
      );
  }
}
