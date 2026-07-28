import type { ReactNode } from 'react';

import { DEFAULT_LOCALE } from '@/lib/locale';
import { routes } from '@/lib/routes';

import '@/styles/tokens.css';
import '@/styles/globals.css';

/**
 * The root layout for `/` alone — ARCHITECTURE.md §4. A second root layout exists so
 * that the localised tree can own its own <html lang>; middleware is not an option
 * under a static export, so the redirect is a meta refresh emitted here, in the head,
 * where it works with JavaScript disabled.
 */
export default function RootRedirectLayout({ children }: { children: ReactNode }) {
  const destination = routes.home(DEFAULT_LOCALE);

  return (
    <html lang={DEFAULT_LOCALE}>
      <head>
        <meta content={`0; url=${destination}`} httpEquiv="refresh" />
        <link href={destination} rel="canonical" />
      </head>
      <body>{children}</body>
    </html>
  );
}
