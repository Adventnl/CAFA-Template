import { AppLink } from '@/components/primitives/AppLink';
import { Text } from '@/components/primitives/Text';
import type { Dictionary } from '@/content/dictionaries/zh';
import type { Site } from '@/content/site';
import type { Locale } from '@/lib/types';

import styles from './SiteFooter.module.css';

interface SiteFooterProps {
  locale: Locale;
  dictionary: Dictionary;
  contact: Site['contact'];
  socials: Site['socials'];
  /** Resolved by the layout at build time — a component does not read the clock. */
  year: number;
}

export function SiteFooter({ locale, dictionary, contact, socials, year }: SiteFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <dl className={styles.contact}>
          <div className={styles.pair}>
            <Text as="dt" role="label" className={styles.term}>
              {dictionary.contact.emailLabel}
            </Text>
            <Text as="dd" role="meta">
              <AppLink className={styles.link} href={`mailto:${contact.email[locale]}`}>
                {contact.email[locale]}
              </AppLink>
            </Text>
          </div>

          <div className={styles.pair}>
            <Text as="dt" role="label" className={styles.term}>
              {dictionary.contact.wechatLabel}
            </Text>
            <Text as="dd" role="meta">
              {contact.wechat[locale]}
            </Text>
          </div>

          <div className={styles.pair}>
            <Text as="dt" role="label" className={styles.term}>
              {dictionary.contact.addressLabel}
            </Text>
            <Text as="dd" role="meta">
              {contact.address[locale]}
            </Text>
          </div>

          <div className={styles.pair}>
            <Text as="dt" role="label" className={styles.term}>
              {dictionary.contact.followLabel}
            </Text>
            <dd className={styles.socials}>
              {socials.map((social) => (
                <AppLink key={social.href} className={styles.link} href={social.href}>
                  <Text as="span" role="meta">
                    {social.label[locale]}
                  </Text>
                </AppLink>
              ))}
            </dd>
          </div>
        </dl>

        <Text role="meta" className={styles.copyright}>
          {dictionary.footer.copyright.replace('{year}', String(year))}
        </Text>
      </div>
    </footer>
  );
}
