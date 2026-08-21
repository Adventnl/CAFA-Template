import Link from 'next/link';

import { Grid } from '@/components/primitives/Grid';
import { Text } from '@/components/primitives/Text';
import { getSite } from '@/lib/content';
import { HOME_SLUG, routes } from '@/lib/routes';

import styles from './page.module.css';

/**
 * `/` under `output: 'export'`. There is no server, so no redirect() — a meta
 * refresh moves anyone with scripting or not, and the link underneath is what a
 * crawler and a stalled refresh both get. ARCHITECTURE.md §4.
 */
export default function RootPage() {
  const site = getSite();
  const locale = site.locales[0];
  const href = routes.page(locale, HOME_SLUG);

  return (
    <Grid className={styles.page}>
      <meta httpEquiv="refresh" content={`0; url=${href}`} />
      <Link href={href} className={styles.link}>
        <Text role="label" as="span">
          {site.name[locale]}
        </Text>
      </Link>
    </Grid>
  );
}
