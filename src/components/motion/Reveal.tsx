'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import styles from './Reveal.module.css';

/**
 * Where scroll-driven animations exist, Reveal.module.css does the whole job on
 * the compositor and this component contributes no behaviour at all. The
 * observer below is the fallback CLAUDE.md §8 asks for, not the mechanism.
 *
 * Read once per document rather than per element. On the server `CSS` is
 * undefined; the browser bundle evaluates this again for itself.
 */
const scrollDriven = typeof CSS !== 'undefined' && CSS.supports('animation-timeline', 'view()');

/**
 * One observer for the whole page, created on first use. ARCHITECTURE.md §5.3.
 */
let shared: IntersectionObserver | undefined;

function observer(): IntersectionObserver {
  shared ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-reveal', 'visible');
        shared?.unobserve(entry.target); // one reveal per element, ever
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.1 },
  );
  return shared;
}

interface RevealProps {
  children: ReactNode;
  /** Capped at three: beyond that a stagger reads as slow, not choreographed. */
  step?: number;
  /** So the wrapper can be the laid-out element instead of adding one. */
  className?: string;
}

export function Reveal({ children, step = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollDriven) return;
    const element = ref.current;
    if (element === null) return;
    const io = observer();
    io.observe(element);
    return () => io.unobserve(element);
  }, []);

  return (
    <div
      ref={ref}
      data-reveal="pending"
      className={[styles.reveal, className].filter(Boolean).join(' ')}
      style={{ transitionDelay: `calc(var(--stagger-step) * ${Math.min(step, 3)})` }}
    >
      {children}
    </div>
  );
}
