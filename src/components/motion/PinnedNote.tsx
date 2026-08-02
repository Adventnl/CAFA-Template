'use client';

import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

import styles from './PinnedNote.module.css';

interface PinnedNoteProps {
  /** The popover id a `popovertarget` button elsewhere on the page points at.
      Both ends read it from lib/routes `panels` so they cannot drift apart. */
  id: string;
  /** The panel's accessible name — it has no visible heading. */
  label: string;
  /** Accessible name for the close mark, which is drawn rather than written. */
  closeLabel: string;
  children: ReactNode;
}

/**
 * A card put on the board over whatever page you are on, and moved by hand.
 * MOTION.md §5.5b.
 *
 * The open/close is not ours: `popover` gives the top layer, light dismiss, Esc,
 * the invoker's aria-expanded and the tab order into the panel, for no bytes at
 * all — so the trigger stays a plain button in a server-rendered nav and there is
 * no open-state anywhere in React. All this component adds is the drag, which is
 * the one part the platform has no declarative form of.
 *
 * The top layer is also what makes the placement possible: SiteHeader carries a
 * view-transition-name, and a named element is a containing block for fixed
 * descendants, so a note rendered inside the bar would be positioned against the
 * bar rather than the viewport. In the top layer nothing above it applies.
 *
 * The drag is mouse-only, and that is the touch decision CLAUDE.md §9 asks to be
 * taken rather than inherited: dragging on touch means `touch-action: none`,
 * which is the page's scroll surrendered to a card that covers most of a phone.
 * On touch the note is simply a panel, the way it is for a keyboard.
 *
 * No React state and no re-renders: the offset lives in a ref and reaches the
 * page as two custom properties, written once per frame in a rAF with no DOM
 * read anywhere near it — the limits are measured once, at the press. CLAUDE.md
 * §7. What those properties then *do* is entirely in the stylesheet.
 */

/** How far the pointer travels before a press counts as a drag rather than as a
    click or the start of a selection. Under this the card does not move at all,
    which is what keeps the address selectable and the email link clickable. */
const DRAG_THRESHOLD = 4;

interface Drag {
  pointerId: number;
  /** Where the press began. */
  startX: number;
  startY: number;
  /** The card's offset when it began. */
  baseX: number;
  baseY: number;
  /** The board's edges, as limits on that offset. Measured once, at the press. */
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  /** False until the threshold is passed — a press is not yet a drag. */
  moving: boolean;
}

/** Low bound wins when the card is larger than the viewport, so what stays on
    screen is its top-left corner — the tack, the address — rather than its foot. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(Math.min(value, max), min);
}

export function PinnedNote({ id, label, closeLabel, children }: PinnedNoteProps) {
  const note = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const offset = useRef({ x: 0, y: 0 });
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const el = note.current;
    if (el === null || event.pointerType !== 'mouse' || event.button !== 0) return;
    // The link and the close mark keep their own behaviour.
    if (event.target instanceof Element && event.target.closest('a, button') !== null) return;

    // The one DOM read in the whole interaction, and it is deliberately here:
    // before anything has been written this frame, and never again until the
    // next press. Everything after this is arithmetic on numbers we already hold.
    const rect = el.getBoundingClientRect();
    const room = document.documentElement;
    const { x, y } = offset.current;

    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: x,
      baseY: y,
      minX: x - rect.left,
      maxX: x + room.clientWidth - rect.right,
      minY: y - rect.top,
      maxY: y + room.clientHeight - rect.bottom,
      moving: false,
    };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const el = note.current;
    const state = drag.current;
    if (el === null || state === null || event.pointerId !== state.pointerId) return;

    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;

    if (!state.moving) {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
      state.moving = true;
      el.setPointerCapture(state.pointerId);
      el.setAttribute('data-dragging', '');
      // user-select stops the *next* selection; a range the press already began
      // would otherwise be dragged across the card as it moves.
      window.getSelection()?.removeAllRanges();
    }

    offset.current = {
      x: clamp(state.baseX + dx, state.minX, state.maxX),
      y: clamp(state.baseY + dy, state.minY, state.maxY),
    };

    if (frame.current === 0) {
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        el.style.setProperty('--note-x', `${offset.current.x}px`);
        el.style.setProperty('--note-y', `${offset.current.y}px`);
      });
    }
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    const el = note.current;
    const state = drag.current;
    if (el === null || state === null || event.pointerId !== state.pointerId) return;

    if (el.hasPointerCapture(state.pointerId)) el.releasePointerCapture(state.pointerId);
    el.removeAttribute('data-dragging');
    drag.current = null;
  }

  return (
    // The card stays where it was put for as long as the page is open — it is an
    // object, not a menu, and it is clamped to the viewport at every press, so
    // it can be moved anywhere and left there without being lost off an edge.
    <div
      ref={note}
      id={id}
      popover="auto"
      role="dialog"
      aria-label={label}
      className={styles.note}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onLostPointerCapture={onPointerEnd}
    >
      <button
        type="button"
        aria-label={closeLabel}
        className={styles.close}
        popoverTarget={id}
        popoverTargetAction="hide"
      />
      {children}
    </div>
  );
}
