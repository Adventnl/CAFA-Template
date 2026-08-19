import Link from 'next/link';

import { Text } from '@/components/primitives/Text';
import { scenes, sceneAttrs } from '@/lib/choreography';
import { cx } from '@/lib/class-names';
import { routes } from '@/lib/routes';
import type { Locale, Work } from '@/lib/types';

import styles from './WorkPager.module.css';

interface WorkPagerProps {
  locale: Locale;
  previous: Work | null;
  next: Work | null;
  labels: { previous: string; next: string };
  navLabel: string;
  /** The site's footer note, which this block sets between the two links. */
  note: string;
  className?: string;
}

export function WorkPager({
  locale,
  previous,
  next,
  labels,
  navLabel,
  note,
  className,
}: WorkPagerProps) {
  return (
    // data-page-close is a contract with SiteFooter, not decoration: this block
    // draws the rule that closes a work page and carries the footer's own line
    // between its two links, so the footer stands down entirely rather than
    // repeating that line a screen further down.
    //
    // The note sits outside the <nav>, because a copyright line is not
    // navigation — the grid is what puts it between the links, not the markup.
    <div
      className={cx(styles.close, className)}
      data-page-close=""
      {...sceneAttrs(scenes.workPager)}
    >
      <nav aria-label={navLabel} className={styles.steps}>
        <Step locale={locale} work={previous} label={labels.previous} />
        <Step locale={locale} work={next} label={labels.next} align="end" />
      </nav>
      <Text role="meta" className={styles.note}>
        {note}
      </Text>
    </div>
  );
}

/**
 * Renders an empty cell rather than nothing when there is no neighbour, so the
 * remaining link stays on the side it belongs to. The ends do not wrap.
 */
function Step({
  locale,
  work,
  label,
  align,
}: {
  locale: Locale;
  work: Work | null;
  label: string;
  align?: 'end';
}) {
  if (work === null) return <div />;

  return (
    <Link
      href={routes.work(locale, work.slug)}
      className={styles.step}
      data-align={align}
      rel={align === 'end' ? 'next' : 'prev'}
    >
      <Text role="label" as="span" className={styles.label}>
        {label}
      </Text>
      <Text role="index" as="span">
        {work.title[locale]}
      </Text>
    </Link>
  );
}
