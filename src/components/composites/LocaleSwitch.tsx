'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Text } from '@/components/primitives/Text';
import { swapLocale } from '@/lib/routes';
import type { Locale } from '@/lib/types';

import styles from './LocaleSwitch.module.css';

interface LocaleSwitchProps {
  current: Locale;
  /** Plain data only — SiteContent carries route functions, which cannot cross
      the server/client boundary. */
  options: readonly { locale: Locale; name: string }[];
  navLabel: string;
}

/**
 * The only reason this is a client component: it needs the current pathname to
 * offer the counterpart page rather than dumping the visitor on the home page.
 * The hrefs are correct in the prerendered HTML, so it works before hydration.
 */
export function LocaleSwitch({ current, options, navLabel }: LocaleSwitchProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={navLabel} className={styles.switch}>
      {options.map(({ locale, name }) => (
        <Link
          key={locale}
          href={swapLocale(pathname, locale)}
          hrefLang={locale}
          aria-current={locale === current ? 'true' : undefined}
          className={styles.option}
        >
          <Text role="label" as="span">
            {name}
          </Text>
        </Link>
      ))}
    </nav>
  );
}
