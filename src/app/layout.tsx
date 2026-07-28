import type { ReactNode } from 'react';

import '@/styles/tokens.css';
import '@/styles/fonts.css';
import '@/styles/globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh">
      <head>
        {/* Only the Latin face is preloaded: it sets every page. latin-ext and the
            CJK files are left to unicode-range to fetch if a page needs them. */}
        <link
          rel="preload"
          href="/fonts/inter-var-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
