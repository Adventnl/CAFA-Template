import Link from 'next/link';
import type { ReactNode } from 'react';

import { Reveal } from '@/components/motion/Reveal';
import { MediaFrame } from '@/components/primitives/MediaFrame';
import { Text } from '@/components/primitives/Text';
import type { ImageEntry } from '@/lib/image-manifest';
import { routes } from '@/lib/routes';
import type { Locale, Work } from '@/lib/types';

import styles from './WorkIndexRow.module.css';

interface WorkIndexRowProps {
  work: Work;
  locale: Locale;
  statusLabel: string;
  /** null for a private work, which publishes no cover. */
  cover: ImageEntry | null;
  /**
   * The first row that has a cover. On a touch device that cover is in the
   * initial viewport and is the LCP element, so it is fetched eagerly; on a
   * pointer device it is the one image the hover backdrop is most likely to
   * want first, so the fetch is not wasted there either.
   */
  priority?: boolean;
  /**
   * Whether this row's inline cover is the one a navigation should carry. Only
   * ever true where there is no hover backdrop — on a pointer device the inline
   * cover is display: none and the backdrop holds the name instead.
   */
  morphing?: boolean;
  /** Reports which cover the backdrop should show; null on leaving the row. */
  onPreview: (slug: string | null) => void;
  /** Reports the row a press has committed to. See WorkIndex. */
  onChoose: (slug: string) => void;
}

export function WorkIndexRow({
  work,
  locale,
  statusLabel,
  cover,
  priority,
  morphing,
  onPreview,
  onChoose,
}: WorkIndexRowProps) {
  const contents = (
    <RowContents
      work={work}
      locale={locale}
      statusLabel={statusLabel}
      cover={cover}
      priority={priority}
      morphing={morphing}
    />
  );

  return (
    <li className={styles.row}>
      <Reveal>
        {work.status === 'private' ? (
          // DESIGN-SYSTEM.md §7: not a link at all, rather than a disabled one.
          <span className={styles.link} data-private="">
            {contents}
          </span>
        ) : (
          <Link
            href={routes.work(locale, work.slug)}
            className={styles.link}
            onPointerEnter={() => onPreview(work.slug)}
            onPointerLeave={() => onPreview(null)}
            onPointerDown={() => onChoose(work.slug)}
            onFocus={() => onPreview(work.slug)}
            onBlur={() => onPreview(null)}
          >
            {contents}
          </Link>
        )}
      </Reveal>
    </li>
  );
}

/** Private in this file: the two branches above differ only in their wrapper. */
function RowContents({
  work,
  locale,
  statusLabel,
  cover,
  priority,
  morphing,
}: Omit<WorkIndexRowProps, 'onPreview' | 'onChoose'>): ReactNode {
  return (
    <>
      {cover !== null && (
        // Shown only where there is no hover backdrop, hidden by CSS elsewhere,
        // and lazy — so a pointer device never fetches it.
        <MediaFrame
          entry={cover}
          alt={work.cover.alt === '' ? '' : work.cover.alt[locale]}
          sizes="(min-width: 768px) 46vw, 92vw"
          priority={priority}
          className={[styles.cover, morphing === true && styles.morphing]
            .filter(Boolean)
            .join(' ')}
        />
      )}
      <span className={styles.line}>
        <Text role="meta" as="span" className={styles.number}>
          {String(work.index).padStart(3, '0')}
        </Text>
        <Text role="index" as="span" className={styles.title}>
          {work.title[locale]}
        </Text>
        <span className={styles.discipline}>
          {work.discipline.map((discipline) => (
            <Text key={discipline.en} role="meta" as="span">
              {discipline[locale]}
            </Text>
          ))}
        </span>
        <span className={styles.status}>
          <Text role="meta" as="span">
            {work.year}
          </Text>
          <Text role="meta" as="span">
            {statusLabel}
          </Text>
        </span>
      </span>
    </>
  );
}
