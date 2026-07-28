import { AppLink } from '@/components/primitives/AppLink';
import { Text } from '@/components/primitives/Text';
import type { Dictionary } from '@/content/dictionaries/zh';
import type { NavItem } from '@/content/site';
import { routes } from '@/lib/routes';
import type { Locale } from '@/lib/types';

import { LocaleSwitch } from './LocaleSwitch';
import { MobileMenu } from './MobileMenu';
import styles from './SiteHeader.module.css';

/**
 * ium.jp's frame: logotype hard left on the page gutter, everything else right, and
 * no background, border or shadow between them. Fixed from --bp-md up; below that it
 * scrolls away with the page, where a fixed bar would cost too much of the viewport.
 *
 * Server-rendered. The nav links are built once here and handed to both the inline
 * nav and the mobile panel.
 */

interface SiteHeaderProps {
  locale: Locale;
  dictionary: Dictionary;
  nav: readonly NavItem[];
}

export function SiteHeader({ locale, dictionary, nav }: SiteHeaderProps) {
  const links = nav.map((item) => (
    <AppLink key={item.key} className={styles.navLink} href={item.href(locale)}>
      <Text as="span" role="label">
        {dictionary.nav[item.key]}
      </Text>
    </AppLink>
  ));

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <AppLink className={styles.lockup} href={routes.home(locale)}>
          <Text as="span" role="meta" className={styles.mark}>
            {dictionary.site.lockupMark}
          </Text>
          <Text as="span" role="meta" className={styles.name}>
            {dictionary.site.lockupName}
          </Text>
        </AppLink>

        <div className={styles.actions}>
          <nav aria-label={dictionary.a11y.primaryNavigation} className={styles.nav}>
            {links}
          </nav>

          <MobileMenu
            closeLabel={dictionary.a11y.closeMenu}
            openLabel={dictionary.a11y.openMenu}
            panelLabel={dictionary.a11y.menuPanel}
          >
            {links}
          </MobileMenu>

          <LocaleSwitch
            ariaLabel={dictionary.a11y.localeSwitch}
            labels={dictionary.localeSwitch}
            locale={locale}
          />
        </div>
      </div>
    </header>
  );
}
