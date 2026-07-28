'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Client, for one reason: `aria-current` has to compare the live pathname, and the
 * header that needs it sits in a layout, which is never told which page it wraps.
 * Doing it here means no surface ever has to pass a `current` flag down.
 */

const EXTERNAL = /^https?:\/\//;

/** `trailingSlash: true` means routes arrive as `/zh/works/` but are written `/zh/works`. */
function normalise(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

interface AppLinkProps {
  /** A result from lib/routes, an absolute URL, or a mailto:. Never a hand-typed route. */
  href: string;
  children: ReactNode;
  className?: string;
}

export function AppLink({ href, children, className }: AppLinkProps) {
  const pathname = usePathname();

  if (!href.startsWith('/')) {
    const external = EXTERNAL.test(href);
    return (
      <a
        className={className}
        href={href}
        rel={external ? 'noreferrer noopener' : undefined}
        target={external ? '_blank' : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      aria-current={normalise(pathname) === normalise(href) ? 'page' : undefined}
      className={className}
      href={href}
    >
      {children}
    </Link>
  );
}
