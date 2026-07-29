import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MediaSequence } from '@/components/composites/MediaSequence';
import { WorkMetaPanel } from '@/components/composites/WorkMetaPanel';
import { WorkPager } from '@/components/composites/WorkPager';
import { WorkRail } from '@/components/composites/WorkRail';
import { StickyColumn } from '@/components/motion/StickyColumn';
import { Grid } from '@/components/primitives/Grid';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  getCoverImage,
  getDictionary,
  getPublishedWorks,
  getSite,
  getWork,
  getWorkNeighbours,
  getWorks,
  requireLocale,
} from '@/lib/content';
import { creativeWorkJsonLd } from '@/lib/json-ld';
import { pageMetadata } from '@/lib/metadata';
import { routes } from '@/lib/routes';

import styles from './page.module.css';

interface WorkParams {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return getSite().locales.flatMap((locale) =>
    getPublishedWorks().map((work) => ({ locale, slug: work.slug })),
  );
}

export async function generateMetadata({ params }: WorkParams): Promise<Metadata> {
  const { locale: param, slug } = await params;
  const locale = requireLocale(param);
  const work = getWork(slug);
  if (work === undefined) return {};

  return pageMetadata({
    locale,
    route: (of) => routes.work(of, slug),
    title: work.title[locale],
    description: work.summary[locale],
    image: getCoverImage(work),
  });
}

export default async function WorkPage({ params }: WorkParams) {
  const { locale: param, slug } = await params;
  const locale = requireLocale(param);
  const work = getWork(slug);
  if (work === undefined || work.status === 'private') notFound();

  const dictionary = getDictionary(locale);

  return (
    <Grid className={styles.page}>
      <JsonLd data={creativeWorkJsonLd(work, locale, getCoverImage(work))} />
      <WorkRail
        locale={locale}
        works={getWorks()}
        activeSlug={work.slug}
        label={dictionary.a11y.worksRail}
        className={styles.rail}
      />
      <StickyColumn className={styles.meta}>
        <WorkMetaPanel
          work={work}
          locale={locale}
          labels={dictionary.work}
          statusLabel={dictionary.works.status[work.status]}
        />
      </StickyColumn>
      <MediaSequence
        slug={work.slug}
        cover={work.cover}
        media={work.media}
        locale={locale}
        className={styles.media}
      />
      <WorkPager
        locale={locale}
        {...getWorkNeighbours(slug)}
        labels={dictionary.work}
        navLabel={dictionary.a11y.workPager}
        className={styles.pager}
      />
    </Grid>
  );
}
