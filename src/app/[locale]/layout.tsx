import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/composites/SiteFooter';
import { SiteHeader } from '@/components/composites/SiteHeader';
import { Text } from '@/components/primitives/Text';
import { getDictionary, getSite, requireLocale } from '@/lib/content';

import '@/styles/tokens.css';
import '@/styles/fonts.css';
import '@/styles/globals.css';
import styles from './layout.module.css';

/**
 * There is no app/layout.tsx. A root layout cannot read route params, so a
 * single one would have to hardcode <html lang> — wrong on every page of the
 * other locale, and :lang() drives the CJK leading in tokens.css. This file and
 * app/(root)/layout.tsx are therefore two root layouts.
 */
interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return getSite().locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Pick<LocaleLayoutProps, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  const { meta } = getDictionary(requireLocale(locale));
  return {
    // Without this Next resolves og:image against localhost at build time.
    metadataBase: new URL(getSite().url),
    title: { default: meta.title, template: meta.titleTemplate },
    description: meta.description,
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const locale = requireLocale((await params).locale);
  const site = getSite();
  const dictionary = getDictionary(locale);

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
        <a href="#main" className={styles.skip}>
          <Text role="label" as="span">
            {dictionary.a11y.skipToContent}
          </Text>
        </a>
        <SiteHeader locale={locale} site={site} dictionary={dictionary} />
        <main id="main">{children}</main>
        <SiteFooter locale={locale} site={site} dictionary={dictionary} />
      </body>
    </html>
  );
}
