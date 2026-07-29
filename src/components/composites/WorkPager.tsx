import Link from 'next/link';

import { Text } from '@/components/primitives/Text';
import { routes } from '@/lib/routes';
import type { Locale, Work } from '@/lib/types';

import styles from './WorkPager.module.css';

interface WorkPagerProps {
  locale: Locale;
  previous: Work | null;
  next: Work | null;
  labels: { previous: string; next: string };
  navLabel: string;
  className?: string;
}

export function WorkPager({
  locale,
  previous,
  next,
  labels,
  navLabel,
  className,
}: WorkPagerProps) {
  return (
    <nav aria-label={navLabel} className={[styles.pager, className].filter(Boolean).join(' ')}>
      <Step locale={locale} work={previous} label={labels.previous} />
      <Step locale={locale} work={next} label={labels.next} align="end" />
    </nav>
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
