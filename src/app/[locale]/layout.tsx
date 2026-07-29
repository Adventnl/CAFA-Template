import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/composites/SiteFooter';
import { SiteHeader } from '@/components/composites/SiteHeader';
import { NavStage } from '@/components/motion/NavStage';
import { PageTransition } from '@/components/motion/PageTransition';
import { ScrollField } from '@/components/motion/ScrollField';
import { Text } from '@/components/primitives/Text';
import { getDictionary, getSite, getWorks, requireLocale } from '@/lib/content';
import { sectionSegment, type NavContext } from '@/lib/nav-intent';
import { routes } from '@/lib/routes';

import '@/styles/tokens.css';
import '@/styles/fonts.css';
import '@/styles/globals.css';
import '@/styles/motion/index.css';
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

/**
 * The lookup NavStage classifies against, built from content on the server so
 * the works registry never has to reach the client to answer "which way is one
 * work from another". Locale-independent — the probe locale only shapes paths.
 */
function navContext(): NavContext {
  const site = getSite();
  const probe = site.locales[0];
  return {
    locales: site.locales,
    worksSection: sectionSegment(routes.work(probe, 'x')) ?? '',
    workIndex: Object.fromEntries(getWorks().map((work) => [work.slug, work.index])),
    sectionOrder: site.nav
      .map((item) => sectionSegment(item.href(probe)))
      .filter((segment): segment is string => segment !== undefined),
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
        {/* Both render nothing. NavStage writes each navigation's figure onto
            <html> before the transition and owns scroll restoration (§2);
            ScrollField publishes scroll velocity, direction and progress as
            custom properties for the effects to read (§4). */}
        <NavStage context={navContext()} />
        <ScrollField />
        <a href="#main" className={styles.skip}>
          <Text role="label" as="span">
            {dictionary.a11y.skipToContent}
          </Text>
        </a>
        <SiteHeader locale={locale} site={site} dictionary={dictionary} />
        {/* tabIndex -1 so following the skip link actually moves focus here.
            Without it the hash changes and focus stays on <body>, and the next
            Tab goes back to the top of the nav. */}
        <main id="main" tabIndex={-1}>
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter locale={locale} site={site} dictionary={dictionary} />
      </body>
    </html>
  );
}
