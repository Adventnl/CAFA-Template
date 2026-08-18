'use client';

import { useEffect } from 'react';

/**
 * Scroll as continuous state. MOTION.md §4 (idea four).
 *
 * The scroll-driven timelines in styles/motion/ answer "where is this element",
 * but not "how is the reader moving". This mounts-once client writes that second
 * thing onto :root as custom properties, so an effect can respond to velocity —
 * media that shears imperceptibly while scrolling, a hairline that strengthens
 * while the page moves — with no further JavaScript.
 *
 * It publishes what is read and nothing else: `--scroll-v`, and the pointer
 * position on a fine pointer. A custom property on :root is inherited by every
 * element in the document, so a write no rule consumes still costs a
 * document-wide style invalidation on the frame it happens — which is why
 * `--scroll-p` and `--scroll-dir` are not here. They were, they had no reader,
 * and progress is `animation-timeline: scroll(root)` in CSS anyway.
 *
 * It is one passive scroll listener that does nothing but wake the loop, and one
 * rAF loop that reads `scrollY` and nothing geometric (CLAUDE.md §7 forbids a
 * getBoundingClientRect in a scroll path), then writes in a single batched pass.
 * The loop parks itself after a breath of stillness, so it costs nothing at rest.
 */

const PARK_AFTER_MS = 200; // stillness before the loop stops scheduling itself
const VELOCITY_FULL_SCALE = 40; // px moved in a frame that reads as full ±1
const VELOCITY_SMOOTHING = 0.2; // how fast smoothed velocity chases the raw value
const STILL_BELOW = 0.02; // |velocity| under this reads as stillness

export function ScrollField() {
  useEffect(() => {
    const root = document.documentElement;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

    let raf = 0;
    let lastY = window.scrollY;
    let smoothedV = 0;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let pointerDirty = false;
    let lastActivity = performance.now();

    function wake() {
      lastActivity = performance.now();
      if (raf === 0) {
        // Reset the baseline so the first frame after a park does not read a
        // stale delta as a velocity spike.
        lastY = window.scrollY;
        raf = requestAnimationFrame(frame);
      }
    }

    function onScroll() {
      wake();
    }

    function onPointerMove(event: PointerEvent) {
      pointerX = event.clientX / window.innerWidth;
      pointerY = event.clientY / window.innerHeight;
      pointerDirty = true;
      wake();
    }

    function frame() {
      const now = performance.now();

      // ── read ──
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;

      // ── compute ──
      const rawV = Math.max(-1, Math.min(1, delta / VELOCITY_FULL_SCALE));
      smoothedV += (rawV - smoothedV) * VELOCITY_SMOOTHING;

      // ── write (batched, after every read above) ──
      root.style.setProperty('--scroll-v', smoothedV.toFixed(3));
      if (pointerDirty) {
        root.style.setProperty('--px', pointerX.toFixed(4));
        root.style.setProperty('--py', pointerY.toFixed(4));
        pointerDirty = false;
      }

      // ── park when still ──
      const still = Math.abs(smoothedV) < STILL_BELOW && Math.abs(delta) < 0.5;
      if (still && now - lastActivity > PARK_AFTER_MS) {
        smoothedV = 0;
        root.style.setProperty('--scroll-v', '0');
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    if (fine) window.addEventListener('pointermove', onPointerMove, { passive: true });
    wake();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return null;
}
