'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import styles from './Reveal.module.css';

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
}

export function Reveal({ children, step = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      className={styles.reveal}
      style={{ transitionDelay: `calc(var(--stagger-step) * ${Math.min(step, 3)})` }}
    >
      {children}
    </div>
  );
}
