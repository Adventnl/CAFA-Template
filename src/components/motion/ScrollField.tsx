'use client';

import { useEffect } from 'react';

/**
 * Scroll as continuous state. MOTION.md §4 (idea four).
 *
 * The scroll-driven timelines in styles/motion/ answer "where is this element",
 * but not "how is the reader moving". This mounts-once client writes that second
 * thing onto :root as custom properties, so any effect can respond to velocity
 * and direction — media that shears imperceptibly while scrolling, a sticky
 * column that lags the direction of travel — with no further JavaScript.
 *
 * It is one passive scroll listener that does nothing but wake the loop, and one
 * rAF loop that reads `scrollY` and nothing geometric (CLAUDE.md §7 forbids a
 * getBoundingClientRect in a scroll path), then writes in a single batched pass.
 * The document height it needs for progress is measured off the hot path by a
 * ResizeObserver. The loop parks itself after a breath of stillness, so it costs
 * nothing at rest.
 */

const PARK_AFTER_MS = 200; // stillness before the loop stops scheduling itself
const VELOCITY_FULL_SCALE = 40; // px moved in a frame that reads as full ±1
const VELOCITY_SMOOTHING = 0.2; // how fast smoothed velocity chases the raw value
const DIRECTION_DEADZONE = 0.02; // |velocity| below this leaves direction latched

export function ScrollField() {
  useEffect(() => {
    const root = document.documentElement;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

    let raf = 0;
    let lastY = window.scrollY;
    let smoothedV = 0;
    let direction = 1;
    let maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
    let pointerX = 0.5;
    let pointerY = 0.5;
    let pointerDirty = false;
    let lastActivity = performance.now();

    // The one layout read, kept off the frame: recomputed only when the document
    // actually changes size, never per scroll.
    const remeasure = () => {
      maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
    };
    const resizeObserver = new ResizeObserver(remeasure);
    resizeObserver.observe(document.body);

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
      if (Math.abs(smoothedV) > DIRECTION_DEADZONE) direction = smoothedV >= 0 ? 1 : -1;
      const progress = Math.min(1, Math.max(0, y / maxScroll));

      // ── write (batched, after every read above) ──
      root.style.setProperty('--scroll-v', smoothedV.toFixed(3));
      root.style.setProperty('--scroll-dir', String(direction));
      root.style.setProperty('--scroll-p', progress.toFixed(4));
      if (pointerDirty) {
        root.style.setProperty('--px', pointerX.toFixed(4));
        root.style.setProperty('--py', pointerY.toFixed(4));
        pointerDirty = false;
      }

      // ── park when still ──
      const still = Math.abs(smoothedV) < DIRECTION_DEADZONE && Math.abs(delta) < 0.5;
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
      resizeObserver.disconnect();
    };
  }, []);

  return null;
}
