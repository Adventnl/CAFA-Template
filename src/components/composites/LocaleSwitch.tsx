'use client';

import { usePathname } from 'next/navigation';

import { AppLink } from '@/components/primitives/AppLink';
import { Text } from '@/components/primitives/Text';
import { LOCALES, type Locale } from '@/lib/types';

import styles from './LocaleSwitch.module.css';

/**
 * Swaps the first path segment and nothing else, so the switch always lands on the
 * counterpart of the page you are reading. No destination is ever written down here.
 */
function swapLocale(pathname: string, target: Locale): string {
  const segments = pathname.split('/');
  segments[1] = target;
  return segments.join('/');
}

interface LocaleSwitchProps {
  locale: Locale;
  labels: Record<Locale, string>;
  ariaLabel: string;
}

export function LocaleSwitch({ locale, labels, ariaLabel }: LocaleSwitchProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={ariaLabel} className={styles.root}>
      {LOCALES.map((target) => (
        <AppLink
          key={target}
          className={target === locale ? styles.active : styles.inactive}
          href={swapLocale(pathname, target)}
        >
          <Text as="span" role="label">
            {labels[target]}
          </Text>
        </AppLink>
      ))}
    </nav>
  );
}
