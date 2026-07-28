import type { Metadata } from 'next';

import { AppLink } from '@/components/primitives/AppLink';
import { Text } from '@/components/primitives/Text';
import { getDictionary } from '@/lib/content';
import { DEFAULT_LOCALE } from '@/lib/locale';
import { routes } from '@/lib/routes';

import styles from './page.module.css';

/** The visible half of the redirect: what a visitor sees if the refresh is blocked. */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function RootRedirectPage() {
  const dictionary = getDictionary(DEFAULT_LOCALE);

  return (
    <Text as="p" role="body" className={styles.fallback}>
      <AppLink href={routes.home(DEFAULT_LOCALE)}>{dictionary.a11y.homeLink}</AppLink>
    </Text>
  );
}
