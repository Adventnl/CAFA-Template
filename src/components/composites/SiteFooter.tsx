import { Grid } from '@/components/primitives/Grid';
import { Text } from '@/components/primitives/Text';
import type { Dictionary } from '@/lib/content';
import type { Locale, SiteContent } from '@/lib/types';

import styles from './SiteFooter.module.css';

interface SiteFooterProps {
  locale: Locale;
  site: SiteContent;
  dictionary: Dictionary;
}

export function SiteFooter({ locale, site, dictionary }: SiteFooterProps) {
  return (
    <Grid as="footer" className={styles.footer}>
      <Text role="meta" className={styles.note}>
        {dictionary.footer.note}
      </Text>
      <Text role="meta" className={styles.contact}>
        <a href={`mailto:${site.contact.email}`} className={styles.email}>
          {site.contact.email}
        </a>
      </Text>
      <Text role="meta" className={styles.address}>
        {site.contact.address[locale]}
      </Text>
    </Grid>
  );
}
