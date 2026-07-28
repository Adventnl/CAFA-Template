import { Text } from '@/components/primitives/Text';
import type { Dictionary } from '@/lib/content';
import type { Locale, SiteContent } from '@/lib/types';

import styles from './ContactBlock.module.css';

interface ContactBlockProps {
  site: SiteContent;
  locale: Locale;
  labels: Dictionary['contact'];
  className?: string;
}

/**
 * There is no form, and there will not be one: this site has no backend, and a
 * form that silently discards what someone typed is worse than an address. If a
 * form is ever wanted it is a link to whoever hosts it. ARCHITECTURE.md §7.
 */
export function ContactBlock({ site, locale, labels, className }: ContactBlockProps) {
  const { contact } = site;

  return (
    <div className={[styles.block, className].filter(Boolean).join(' ')}>
      <Text role="title" as="p" className={styles.email}>
        <a href={`mailto:${contact.email}`} className={styles.link}>
          {contact.email}
        </a>
      </Text>

      <dl className={styles.facts}>
        <Fact label={labels.wechat}>{contact.wechat}</Fact>
        <Fact label={labels.address}>{contact.address[locale]}</Fact>
        <Fact label={labels.hours}>{contact.hours[locale]}</Fact>
      </dl>

      <Text role="body" className={styles.note}>
        {labels.note}
      </Text>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: string }) {
  return (
    <div className={styles.fact}>
      <Text role="label" as="dt" className={styles.factLabel}>
        {label}
      </Text>
      <Text role="meta" as="dd" className={styles.factValue}>
        {children}
      </Text>
    </div>
  );
}
