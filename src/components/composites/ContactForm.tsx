'use client';

import { useState, type FormEvent } from 'react';

import { Text } from '@/components/primitives/Text';
import type { Dictionary, Locale } from '@/lib/types';

import styles from './ContactForm.module.css';

interface ContactFormProps {
  /** Where the message goes — the studio's address, out of the content bundle. */
  to: string;
  /**
   * Where to post it, or null where there is nowhere to post.
   *
   * Null is not a broken deployment. It is a site whose admin has not been told
   * its own origin, or one built from a revision published before the endpoint
   * existed, and the form answers both by doing exactly what it used to: it
   * composes a `mailto:` and hands the reader a draft. Which is why this is a
   * prop rather than something the component reaches for — a composite never
   * imports lib/content (CLAUDE.md §3), and the page above it already reads the
   * bundle for the address beside it.
   */
  endpoint: string | null;
  /** The subject line arrives in the language the card was read in. */
  locale: Locale;
  labels: Dictionary['contact'];
}

/** The field names, written once because they are also the keys read back off it. */
const FROM = 'from';
const MESSAGE = 'message';
/**
 * The honeypot's name. `website` rather than something obviously fake, because
 * the point is for a form-filling bot to recognise it and fill it in.
 */
const TRAP = 'website';

type Status = 'idle' | 'sending' | 'sent' | 'failed';

/** What was typed, kept only so a failed send can still become a draft. */
interface Typed {
  from: string;
  message: string;
}

function typedIn(data: FormData): Typed {
  return {
    from: String(data.get(FROM) ?? ''),
    message: String(data.get(MESSAGE) ?? ''),
  };
}

/**
 * Two fields and a Send that actually sends.
 *
 * **What changed, and why it is not the thing CLAUDE.md §1 forbids.** This used
 * to compose a `mailto:` and navigate, because the repository ships no server
 * runtime and there was nowhere for a POST to land. There is now: the admin
 * grew `/api/v1/contact`, which reads the studio's address out of the published
 * revision and sends the mail. So Send posts.
 *
 * §1 forbids fetching *content* in the browser, and the reason it gives is
 * specific — three serial round trips ahead of the LCP image, and intrinsic
 * dimensions unavailable until after first paint. None of that is this. Nothing
 * is fetched to render anything: the page is complete, prerendered, and static
 * before this component has done anything at all, and the request happens
 * because somebody pressed a button. The endpoint's *address* still arrives at
 * build time, in the content bundle, so `services/` remains the only thing in
 * this repository that knows the admin exists.
 *
 * **The fallback is the whole safety of it.** With no endpoint in the bundle the
 * form behaves exactly as it did before — `mailto:`, a draft in the reader's own
 * client, nothing collected. That is also what a `<form action>` gives a browser
 * with no JavaScript, which is why the action attribute is still a mailto and
 * still not a duplicate: it is the no-script path.
 *
 * **A message is never silently dropped.** Every outcome says which it was. A
 * refusal from the endpoint carries a sentence meant for whoever typed the
 * message — "that does not look like an email address" — and it is shown as it
 * arrived rather than replaced with a generic failure, because the admin is the
 * half that knows what was wrong with it.
 */
export function ContactForm({ to, endpoint, locale, labels }: ContactFormProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [problem, setProblem] = useState('');
  // Held so that "open a draft instead" after a failure carries what was
  // written rather than opening an empty one — the reader has already typed it
  // once and being asked to do so again is the worst moment to ask.
  const [typed, setTyped] = useState<Typed>({ from: '', message: '' });

  function handOver({ from, message }: Typed): void {
    // The typed address is repeated in the body because the mail client sends
    // as whichever identity it is signed in as, which is not necessarily this
    // one — so without it a reply can go somewhere the reader did not ask for.
    const body = `${message}\n\n${labels.from}: ${from}`;

    window.location.href =
      `mailto:${to}` +
      `?subject=${encodeURIComponent(labels.subject)}` +
      `&body=${encodeURIComponent(body)}`;
  }

  async function post(endpointUrl: string, data: FormData): Promise<void> {
    setStatus('sending');
    setProblem('');

    try {
      const answer = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...typedIn(data),
          website: String(data.get(TRAP) ?? ''),
          locale,
        }),
      });

      if (answer.ok) {
        setStatus('sent');
        return;
      }

      // The admin's envelope carries a sentence written for a person. Reading it
      // is the difference between "that does not look like an email address" and
      // a red box that says nothing.
      const body = (await answer.json().catch(() => null)) as { msg?: unknown } | null;
      setProblem(typeof body?.msg === 'string' ? body.msg : '');
      setStatus('failed');
    } catch {
      // The network, not the endpoint. No message to relay, so the card falls
      // back to its own line and the offer of a draft.
      setProblem('');
      setStatus('failed');
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const entered = typedIn(data);
    setTyped(entered);

    if (endpoint === null) {
      handOver(entered);
      return;
    }

    void post(endpoint, data);
  }

  if (status === 'sent') {
    // The form is replaced rather than disabled: what the reader wants to know
    // is that it went, and a spent form sitting under a confirmation invites
    // them to send it twice.
    return (
      <p className={styles.sent} role="status">
        <Text role="index" as="span">
          {labels.sent}
        </Text>
      </p>
    );
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

      {/* The honeypot. Hidden from sight, from the tab order and from a screen
          reader — all three, because a field only some people can reach is a
          trap for them rather than for a bot. `aria-hidden` on a focusable
          control would be the defect, so `tabIndex={-1}` goes with it.
          `autoComplete="off"` keeps a browser from helpfully filling it. */}
      <div className={styles.trap} aria-hidden="true">
        <label>
          {labels.from}
          <input type="text" name={TRAP} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {status === 'failed' && (
        <p className={styles.problem} role="alert">
          <Text role="meta" as="span">
            {problem === '' ? labels.failed : problem}
          </Text>{' '}
          <button type="button" className={styles.fallback} onClick={() => handOver(typed)}>
            <Text role="meta" as="span">
              {labels.draft}
            </Text>
          </button>
        </p>
      )}

      {/* No <Mark>. The highlighter is bounded by a job rather than a surface —
          DESIGN-SYSTEM.md §2 says it marks a label that *goes somewhere*, and
          says to delete it the moment it appears on something that does not.
          Submitting is not navigating, so this takes the other half of §7's
          control vocabulary: the nav's --c-ink-70 to --c-ink over --dur-fast,
          under the same rule the address above it carries. */}
      <button type="submit" className={styles.send} disabled={status === 'sending'}>
        <Text role="label" as="span">
          {status === 'sending' ? labels.sending : labels.send}
        </Text>
      </button>
    </form>
  );
}
