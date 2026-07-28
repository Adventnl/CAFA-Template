import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/composites/SiteFooter';
import { SiteHeader } from '@/components/composites/SiteHeader';
import { Text } from '@/components/primitives/Text';
import { getDictionary, getSite } from '@/lib/content';
import { DEFAULT_LOCALE, localeParams, resolveLocale } from '@/lib/locale';
import { routes } from '@/lib/routes';
import { LOCALES } from '@/lib/types';

import '@/styles/tokens.css';
import '@/styles/fonts.css';
import '@/styles/globals.css';

import styles from './layout.module.css';

/**
 * The root layout for every localised route — it owns <html>, so `lang` can follow the
 * segment. `/` has its own root layout under (root); that is why there is no
 * app/layout.tsx.
 */

/** The skip link's target. Declared beside the <main> it points at, so they cannot drift. */
const CONTENT_ID = 'content';

export function generateStaticParams() {
  return localeParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const dictionary = getDictionary(locale);
  const home = routes.home(locale);

  return {
    metadataBase: new URL(getSite().url),
    title: { default: dictionary.site.name, template: dictionary.site.titleTemplate },
    description: dictionary.site.description,
    alternates: {
      canonical: home,
      languages: {
        ...Object.fromEntries(LOCALES.map((entry) => [entry, routes.home(entry)])),
        'x-default': routes.home(DEFAULT_LOCALE),
      },
    },
    openGraph: {
      description: dictionary.site.description,
      siteName: dictionary.site.name,
      title: dictionary.site.name,
      type: 'website',
      url: home,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  const dictionary = getDictionary(locale);
  const site = getSite();

  return (
    <html lang={locale}>
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
      <body>
        <a className={styles.skipLink} href={`#${CONTENT_ID}`}>
          <Text as="span" role="label">
            {dictionary.a11y.skipToContent}
          </Text>
        </a>

        <SiteHeader dictionary={dictionary} locale={locale} nav={site.nav} />

        <main className={styles.main} id={CONTENT_ID}>
          {children}
        </main>

        <SiteFooter
          contact={site.contact}
          dictionary={dictionary}
          locale={locale}
          socials={site.socials}
          year={new Date().getFullYear()}
        />
      </body>
    </html>
  );
}
