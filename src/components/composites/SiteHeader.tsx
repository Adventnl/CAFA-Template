import Link from 'next/link';

import { Grid } from '@/components/primitives/Grid';
import { Mark } from '@/components/primitives/Mark';
import { Text } from '@/components/primitives/Text';
import { panels, routes } from '@/lib/routes';
import type { Dictionary, Locale, NavItem, SiteContent } from '@/lib/types';

import { LocaleSwitch } from './LocaleSwitch';
import styles from './SiteHeader.module.css';

interface SiteHeaderProps {
  locale: Locale;
  site: SiteContent;
  /** The three inner pages, in the order the bar carries them. */
  nav: readonly NavItem[];
  dictionary: Dictionary;
}

export function SiteHeader({ locale, site, nav, dictionary }: SiteHeaderProps) {
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
          {/* The bar is the pages, and then the one destination that is not a
              page. A page item is a Link; Contact is a button that opens a
              popover where the reader stands — `popovertarget` needs no
              JavaScript and no state up here, since the browser owns the
              open/close, the Esc key and the button's aria-expanded.
              components/motion/PinnedNote. */}
          {/* <Mark> is the label rather than the link because the stroke is drawn
              over the *word*: the link is a --tap-min box and a highlighter the
              height of a touch target is a banner. */}
          <nav aria-label={dictionary.a11y.primaryNav} className={styles.links}>
            {nav.map((item) => (
              <Link key={item.page} href={routes[item.page](locale)} className={styles.link}>
                <Mark role="label">{item.label[locale]}</Mark>
              </Link>
            ))}
            <button type="button" popoverTarget={panels.contact} className={styles.link}>
              <Mark role="label">{dictionary.contact.nav}</Mark>
            </button>
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
