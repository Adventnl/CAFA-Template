'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import { Text } from '@/components/primitives/Text';

import styles from './MobileMenu.module.css';

/**
 * The only stateful component in the site chrome. It renders the nav it is given —
 * the links themselves are built on the server by SiteHeader and passed through as
 * children, so the mobile and desktop navs can never disagree.
 */

const FOCUSABLE = 'a[href], button:not([disabled])';

interface MobileMenuProps {
  openLabel: string;
  closeLabel: string;
  panelLabel: string;
  children: ReactNode;
}

export function MobileMenu({ openLabel, closeLabel, panelLabel, children }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    if (!open || !panel) return;

    const focusable = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    focusable()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    // Following a link closes the panel — including a link to the page already open,
    // which a route-change subscription would miss.
    const onClick = (event: MouseEvent) => {
      const { target } = event;
      if (target instanceof Element && target.closest('a[href]')) setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    panel.addEventListener('click', onClick);
    const restoreOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      panel.removeEventListener('click', onClick);
      document.body.style.overflow = restoreOverflow;
      toggle?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className={styles.toggle}
        onClick={() => setOpen((value) => !value)}
        ref={toggleRef}
        type="button"
      >
        <Text as="span" role="label">
          {openLabel}
        </Text>
      </button>

      <div
        aria-label={panelLabel}
        aria-modal="true"
        className={styles.panel}
        hidden={!open}
        id={panelId}
        ref={panelRef}
        role="dialog"
      >
        <button className={styles.close} onClick={() => setOpen(false)} type="button">
          <Text as="span" role="label">
            {closeLabel}
          </Text>
        </button>
        <div className={styles.links}>{children}</div>
      </div>
    </>
  );
}
