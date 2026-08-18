import { Grid } from '@/components/primitives/Grid';
import { Text } from '@/components/primitives/Text';
import { scenes, sceneAttrs } from '@/lib/choreography';
import type { Dictionary, Locale, SiteContent } from '@/lib/types';

import styles from './SiteFooter.module.css';

interface SiteFooterProps {
  locale: Locale;
  site: SiteContent;
  dictionary: Dictionary;
}

export function SiteFooter({ locale, site, dictionary }: SiteFooterProps) {
  return (
    // Full-bleed for the same reason as the header: the rule above it has to
    // reach the edges of the viewport, not the edges of the grid.
    <footer className={styles.footer} {...sceneAttrs(scenes.footer)}>
      <Grid className={styles.inner}>
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
    </footer>
  );
}
