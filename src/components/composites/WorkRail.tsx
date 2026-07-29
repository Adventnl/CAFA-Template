import Link from 'next/link';

import { Text } from '@/components/primitives/Text';
import { routes } from '@/lib/routes';
import type { Locale, Work } from '@/lib/types';
import { vtName } from '@/lib/vt-names';

import styles from './WorkRail.module.css';

interface WorkRailProps {
  locale: Locale;
  works: readonly Work[];
  /** The work whose page this is; its number is expanded to show the title. */
  activeSlug: string;
  label: string;
  className?: string;
}

/**
 * The compressed face of the works index. MOTION.md §7, decision A.
 *
 * On a work's own page the index does not disappear — it becomes this: a sticky
 * column of just the numbers at the far left, the active one expanded to its
 * title. It carries the same `rail` view-transition-name the full list does, so
 * the browser interpolates one into the other and the list is seen to compress.
 * Clicking a number is a step-work navigation.
 *
 * A Server Component — numbers and links, no state — so it adds nothing to the
 * detail page's bundle. It is not rendered below --bp-lg (the CSS hides it): a
 * rail costs width a phone cannot spare, and the pager already answers the same
 * question there.
 */
export function WorkRail({ locale, works, activeSlug, label, className }: WorkRailProps) {
  return (
    <nav aria-label={label} className={[styles.rail, className].filter(Boolean).join(' ')}>
      <ol className={styles.list}>
        {works.map((work) => (
          <RailEntry key={work.slug} work={work} locale={locale} active={work.slug === activeSlug} />
        ))}
      </ol>
    </nav>
  );
}

function RailEntry({ work, locale, active }: { work: Work; locale: Locale; active: boolean }) {
  const number = (
    <Text
      role="meta"
      as="span"
      className={[styles.number, active && styles.railEntry].filter(Boolean).join(' ')}
      // The active number carries the per-slug name so it receives the number
      // that travelled in from the full list (or holds still while paging).
      style={active ? { viewTransitionName: vtName.railEntry(work.slug) } : undefined}
    >
      {String(work.index).padStart(3, '0')}
    </Text>
  );

  return (
    <li className={styles.entry} data-active={active ? '' : undefined}>
      {work.status === 'private' ? (
        // Consistent with the index: a private work is a number, not a link.
        <span className={styles.link} data-private="">
          {number}
        </span>
      ) : (
        <Link
          href={routes.work(locale, work.slug)}
          className={styles.link}
          aria-current={active ? 'page' : undefined}
        >
          {number}
        </Link>
      )}
      {active && (
        <Text role="meta" as="span" className={styles.title}>
          {work.title[locale]}
        </Text>
      )}
    </li>
  );
}
