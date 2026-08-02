'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

import { HoverMediaLayer } from '@/components/motion/HoverMediaLayer';
import { Text } from '@/components/primitives/Text';
import type { ImageEntry } from '@/lib/image-manifest';
import { routes } from '@/lib/routes';
import type { Locale, Work } from '@/lib/types';
import { vtName } from '@/lib/vt-names';

import styles from './WorkRail.module.css';

interface WorkRailProps {
  locale: Locale;
  works: readonly Work[];
  /** Manifest entries keyed by slug — the same set the index hovers, resolved on
      the server so the client never receives the whole manifest. Private absent. */
  covers: Record<string, ImageEntry>;
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
 *
 * It is also the second half of the ium hover figure, which is why this is a
 * client component and the server one it replaced is gone. Hovering a number
 * fills the viewport behind the page with that work's cover exactly as the index
 * does, the page steps back to --preview-dim behind it, and the click that
 * follows morphs the same photograph into the next work's media column. The
 * figure is `step-work` either way; what makes it a morph rather than a slide is
 * only that the backdrop and the arriving hero share cover-{slug} (styles/motion/
 * step-work.css). Reaching a work from the index and reaching it from the rail
 * are therefore the same move, which is the whole point of the rail.
 *
 * It is not rendered below --bp-lg (the CSS hides it): a rail costs width a phone
 * cannot spare, and the pager already answers the same question there.
 */
export function WorkRail({ locale, works, covers, activeSlug, label, className }: WorkRailProps) {
  const [previewed, setPreviewed] = useState<string | null>(null);
  const preloaded = useRef(false);

  /**
   * Covers are warmed when the pointer first reaches the rail, not on load: a
   * visitor who never hovers never pays for them, and one who arrived from the
   * index has them in cache already. Only AVIF is preloaded — the `type` makes a
   * browser without it skip the hint rather than fetch twice. (WorkIndex warms
   * the same set on its own list; two uses, so they stay separate — CLAUDE.md §5.)
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
    <>
      <HoverMediaLayer
        entry={previewed === null ? null : (covers[previewed] ?? null)}
        name={previewed === null ? undefined : vtName.cover(previewed)}
      />
      {/* data-previewing is a plain attribute rather than a module class so the
          page can dim its own parts behind the backdrop with one :has() rule. */}
      <nav
        aria-label={label}
        className={[styles.rail, className].filter(Boolean).join(' ')}
        data-previewing={previewed === null ? undefined : ''}
        onPointerEnter={(event) => {
          // A tap raises pointerenter too, and there is no backdrop on a touch
          // device — the rail is not even rendered at the widths it lives at.
          if (event.pointerType === 'mouse') preloadCovers();
        }}
      >
        <ol className={styles.list}>
          {works.map((work) => (
            <RailEntry
              key={work.slug}
              work={work}
              locale={locale}
              active={work.slug === activeSlug}
              onPreview={setPreviewed}
            />
          ))}
        </ol>
      </nav>
    </>
  );
}

function RailEntry({
  work,
  locale,
  active,
  onPreview,
}: {
  work: Work;
  locale: Locale;
  active: boolean;
  /** Reports which cover the backdrop should show; null on leaving the entry. */
  onPreview: (slug: string | null) => void;
}) {
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
        // Consistent with the index: a private work is a number, not a link. It
        // publishes no cover either, so there is nothing for it to preview.
        <span className={styles.link} data-private="">
          {number}
        </span>
      ) : (
        <Link
          href={routes.work(locale, work.slug)}
          className={styles.link}
          aria-current={active ? 'page' : undefined}
          // The active entry previews nothing: its cover is already this page's
          // hero, and two elements holding cover-{slug} at once make the browser
          // abort the transition rather than run it — MOTION.md §0.4.
          onPointerEnter={() => onPreview(active ? null : work.slug)}
          onPointerLeave={() => onPreview(null)}
          onFocus={() => onPreview(active ? null : work.slug)}
          onBlur={() => onPreview(null)}
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
