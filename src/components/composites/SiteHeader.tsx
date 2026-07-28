import Link from 'next/link';

import { Grid } from '@/components/primitives/Grid';
import { Text } from '@/components/primitives/Text';
import type { Dictionary } from '@/lib/content';
import { routes } from '@/lib/routes';
import type { Locale, SiteContent } from '@/lib/types';

import { LocaleSwitch } from './LocaleSwitch';
import styles from './SiteHeader.module.css';

interface SiteHeaderProps {
  locale: Locale;
  site: SiteContent;
  dictionary: Dictionary;
}

export function SiteHeader({ locale, site, dictionary }: SiteHeaderProps) {
  return (
    <Grid as="header" className={styles.header}>
      <Link href={routes.home(locale)} className={styles.brand}>
        <Text role="label" as="span">
          {site.name[locale]}
        </Text>
      </Link>

      <div className={styles.nav}>
        <nav aria-label={dictionary.a11y.primaryNav} className={styles.links}>
          {site.nav.map((item) => (
            <Link key={item.href(locale)} href={item.href(locale)} className={styles.link}>
              <Text role="label" as="span">
                {item.label[locale]}
              </Text>
            </Link>
          ))}
        </nav>
        <LocaleSwitch
          current={locale}
          options={site.locales.map((option) => ({
            locale: option,
            name: site.localeNames[option],
          }))}
          navLabel={dictionary.a11y.localeSwitch}
        />
      </div>
    </Grid>
  );
}
