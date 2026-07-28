'use client';

import { useRef, useState } from 'react';

import { HoverMediaLayer } from '@/components/motion/HoverMediaLayer';
import type { ImageEntry } from '@/lib/image-manifest';
import type { Locale, Work, WorkStatus } from '@/lib/types';

import { WorkIndexRow } from './WorkIndexRow';
import styles from './WorkIndex.module.css';

interface WorkIndexProps {
  locale: Locale;
  works: readonly Work[];
  /** Manifest entries keyed by slug. Resolved on the server so the client never
      receives the whole image manifest. Private works are absent. */
  covers: Record<string, ImageEntry>;
  statusLabels: Record<WorkStatus, string>;
  listLabel: string;
}

/**
 * The one substantial client component in the app. It holds a single piece of
 * state — which row is being previewed — and everything else is CSS reacting to
 * one data attribute. ARCHITECTURE.md §5.1.
 */
export function WorkIndex({ locale, works, covers, statusLabels, listLabel }: WorkIndexProps) {
  const [previewed, setPreviewed] = useState<string | null>(null);
  const preloaded = useRef(false);

  // The topmost row that publishes a cover: the LCP element on a touch device.
  const firstCover = works.find((work) => covers[work.slug] !== undefined)?.slug;

  /**
   * Covers are warmed when the pointer first reaches the list, not on load: a
   * visitor who never hovers never pays for them. Only AVIF is preloaded — the
   * `type` makes a browser without it skip the hint rather than fetch twice.
   */
  function preloadCovers() {
    if (preloaded.current) return;
    preloaded.current = true;

    const { connection } = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (connection?.saveData === true) return;

    for (const entry of Object.values(covers)) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.type = 'image/avif';
      link.imageSrcset = entry.formats.avif.map((v) => `${v.src} ${v.width}w`).join(', ');
      link.imageSizes = '100vw';
      document.head.append(link);
    }
  }

  return (
    <div
      className={styles.index}
      onPointerEnter={(event) => {
        // A touch tap raises pointerenter too, and there is no backdrop to warm
        // on a touch device — its covers are already inline in the rows.
        if (event.pointerType === 'mouse') preloadCovers();
      }}
    >
      <HoverMediaLayer entry={previewed === null ? null : (covers[previewed] ?? null)} />
      {/* data-previewing is a plain attribute, not a module class, so the rule
          that dims the siblings can live in WorkIndexRow.module.css next to the
          class it dims. */}
      <ul
        aria-label={listLabel}
        className={styles.list}
        data-previewing={previewed === null ? undefined : ''}
      >
        {works.map((work) => (
          <WorkIndexRow
            key={work.slug}
            work={work}
            locale={locale}
            statusLabel={statusLabels[work.status]}
            cover={covers[work.slug] ?? null}
            priority={work.slug === firstCover}
            onPreview={setPreviewed}
          />
        ))}
      </ul>
    </div>
  );
}
