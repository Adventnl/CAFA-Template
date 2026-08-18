import { Text } from '@/components/primitives/Text';
import type { Dictionary, Locale, SiteContent } from '@/lib/types';

import styles from './ContactBlock.module.css';

interface ContactBlockProps {
  site: SiteContent;
  locale: Locale;
  labels: Dictionary['contact'];
}

/**
 * There is no form, and there will not be one: this site has no backend, and a
 * form that silently discards what someone typed is worse than an address. If a
 * form is ever wanted it is a link to whoever hosts it. ARCHITECTURE.md §7.
 *
 * This is the card and nothing else — the paper, the edge, the tack and nine
 * lines of type. Where it sits, how it arrives and how it is moved belong to
 * components/motion/PinnedNote, which is the only thing that renders it. It has
 * stayed a server component through that: PinnedNote takes it as `children`, so
 * the copy is in the prerendered HTML and none of it reaches the JS bundle.
 */
export function ContactBlock({ site, locale, labels }: ContactBlockProps) {
  const { contact } = site;

  return (
    <div className={styles.block}>
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
