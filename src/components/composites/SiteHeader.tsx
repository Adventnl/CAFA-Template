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
    // The <header> is full-bleed so its background covers the viewport at any
    // width; the Grid inside it is what aligns to the page columns.
    <header className={styles.header}>
      <Grid className={styles.bar}>
        <Link href={routes.home(locale)} className={styles.brand}>
          <Text role="label" as="span">
            {site.name[locale]}
          </Text>
        </Link>

        <div className={styles.nav}>
          {/* Two kinds of item, and the branch is the whole difference between
              them: a route is a Link, a panel is a button that opens a popover
              where the reader stands. `popovertarget` needs no JavaScript and no
              state up here — the browser owns the open/close, the Esc key and
              the button's aria-expanded. components/motion/PinnedNote. */}
          <nav aria-label={dictionary.a11y.primaryNav} className={styles.links}>
            {site.nav.map((item) =>
              'href' in item ? (
                <Link key={item.href(locale)} href={item.href(locale)} className={styles.link}>
                  <Text role="label" as="span">
                    {item.label[locale]}
                  </Text>
                </Link>
              ) : (
                <button
                  key={item.opens}
                  type="button"
                  popoverTarget={item.opens}
                  className={styles.link}
                >
                  <Text role="label" as="span">
                    {item.label[locale]}
                  </Text>
                </button>
              ),
            )}
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
    </header>
  );
}
