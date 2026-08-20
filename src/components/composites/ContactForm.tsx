'use client';

import type { FormEvent } from 'react';

import { Text } from '@/components/primitives/Text';
import type { Dictionary } from '@/lib/types';

import styles from './ContactForm.module.css';

interface ContactFormProps {
  /** Where the message goes — the studio's address, out of the content bundle. */
  to: string;
  labels: Dictionary['contact'];
}

/** The two field names, written once because they are also the two keys read
    back off the FormData. */
const FROM = 'from';
const MESSAGE = 'message';

/**
 * Two fields and a send, and what Send does is hand the message to the reader's
 * own mail client.
 *
 * That is the whole design decision, and it is the one CLAUDE.md §1 forces: this
 * repository ships no server runtime, so there is nowhere for a POST to land. A
 * form that collects a message and drops it is worse than no form — so this one
 * never holds the message. It composes a `mailto:` and navigates, which means
 * what leaves the page leaves through software the reader already trusts, in
 * their sent items, with their signature on it.
 *
 * The `action` on the form is the same address again, and it is the no-script
 * path rather than a duplicate: a native `method="post"` submission to a mailto
 * hands the fields to the mail client too, more crudely. JavaScript intercepts
 * it here only to write a subject line and a readable body.
 *
 * If the atelier ever wants messages to arrive in an inbox they own rather than
 * in a draft window, that is one endpoint URL in this file's `action` and the
 * deletion of `onSubmit` — not an architecture change. Nothing else here moves.
 *
 * The labels are real <label> elements wrapping their control, not placeholders:
 * a placeholder is gone the moment there is anything to read it against, and at
 * --c-ink-62 on paper it would be the one piece of type on this card that CLAUDE
 * .md §10 could not clear.
 */
export function ContactForm({ to, labels }: ContactFormProps) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const from = String(data.get(FROM) ?? '');
    const message = String(data.get(MESSAGE) ?? '');

    // The typed address is repeated in the body because the mail client sends
    // as whichever identity it is signed in as, which is not necessarily this
    // one — so without it a reply can go somewhere the reader did not ask for.
    const body = `${message}\n\n${labels.from}: ${from}`;

    window.location.href =
      `mailto:${to}` +
      `?subject=${encodeURIComponent(labels.subject)}` +
      `&body=${encodeURIComponent(body)}`;
  }

  return (
    <form
      className={styles.form}
      onSubmit={onSubmit}
      action={`mailto:${to}`}
      method="post"
      encType="text/plain"
    >
      <label className={styles.field}>
        <Text role="label" as="span" className={styles.label}>
          {labels.from}
        </Text>
        <input
          type="email"
          name={FROM}
          required
          autoComplete="email"
          spellCheck={false}
          className={styles.input}
        />
      </label>

      <label className={styles.field}>
        <Text role="label" as="span" className={styles.label}>
          {labels.message}
        </Text>
        {/* rows is the field's intrinsic height, the way width/height are an
            image's: it holds the card's proportions before a character is typed
            rather than letting the UA's two-row default decide them. */}
        <textarea name={MESSAGE} required rows={4} className={styles.message} />
      </label>

      {/* No <Mark>. The highlighter is bounded by a job rather than a surface —
          DESIGN-SYSTEM.md §2 says it marks a label that *goes somewhere*, and
          says to delete it the moment it appears on something that does not.
          Submitting is not navigating, so this takes the other half of §7's
          control vocabulary: the nav's --c-ink-70 to --c-ink over --dur-fast,
          under the same rule the address above it carries. */}
      <button type="submit" className={styles.send}>
        <Text role="label" as="span">
          {labels.send}
        </Text>
      </button>
    </form>
  );
}
