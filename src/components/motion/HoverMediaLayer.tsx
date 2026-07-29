'use client';

import { useState } from 'react';

import type { ImageEntry } from '@/lib/image-manifest';

import styles from './HoverMediaLayer.module.css';

/**
 * The ium backdrop: one fixed, full-bleed layer behind the works index.
 *
 * Two <picture> slots, not one. A single element would have to swap its src
 * while visible, which cuts rather than dissolves when the pointer crosses from
 * one row to the next. The slots ping-pong instead — the incoming cover is
 * written to whichever slot is currently behind, then that slot is brought
 * forward — so nothing ever unmounts and the browser keeps both decoded.
 *
 * Everything visual below is a CSS transition on a data attribute. No JS runs
 * while the pointer moves within a row.
 */
type Slots = { front: 0 | 1; entries: [ImageEntry | null, ImageEntry | null] };

export function HoverMediaLayer({ entry }: { entry: ImageEntry | null }) {
  const [slots, setSlots] = useState<Slots>({ front: 0, entries: [null, null] });

  // Derived during render, which React re-runs without committing the first
  // pass. An effect would paint the outgoing cover for a frame before swapping.
  if (entry !== null && entry !== slots.entries[slots.front]) {
    const front = slots.front === 0 ? 1 : 0;
    const entries: Slots['entries'] = [...slots.entries];
    entries[front] = entry;
    setSlots({ front, entries });
  }

  return (
    <div className={styles.layer} data-visible={entry === null ? undefined : ''} aria-hidden="true">
      {slots.entries.map((slot, index) => {
        const fallback = slot?.formats.webp.at(-1);
        if (slot === null || fallback === undefined) return null;

        return (
          <picture
            key={index}
            className={styles.slot}
            data-front={index === slots.front ? '' : undefined}
          >
            {/* The layer is the viewport, so `sizes` can only ever be 100vw. */}
            <source
              type="image/avif"
              srcSet={slot.formats.avif.map((v) => `${v.src} ${v.width}w`).join(', ')}
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet={slot.formats.webp.map((v) => `${v.src} ${v.width}w`).join(', ')}
              sizes="100vw"
            />
            {/* Decorative here: the row's text carries the meaning, and the same
                image appears with its alt on the work's own page.

                loading="lazy" is doing real work: where this layer is display:
                none the element never intersects anything, so a touch device
                never fetches a cover it cannot show. On a pointer device the
                layer is in the viewport and the fetch starts immediately. */}
            <img src={fallback.src} alt="" decoding="async" loading="lazy" />
          </picture>
        );
      })}
    </div>
  );
}
