'use client';

import { cn } from '@/lib/utils';
import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Inline jargon term with a tap-to-explain definition (issue #1784): a dotted
 * underline that opens a small popover on click / tap / Enter / Space and
 * closes on a second tap, Escape, an outside tap or scroll. Unlike a `title=`
 * tooltip it works on phones and with the keyboard.
 *
 * Safe inside a paragraph or a table header (the trigger is a `<button>`, which
 * is phrasing content). The popover is portalled to `<body>` with fixed
 * positioning, so a scrolling table or a clipped card can't cut it off, and it
 * is clamped to the viewport on narrow screens.
 */

const POPOVER_MAX_WIDTH = 288;
const VIEWPORT_GUTTER = 16;

export interface TermProps {
  /** The visible term, e.g. "Column 2". */
  children: React.ReactNode;
  /** One or two plain-English sentences. */
  definition: string;
  /** Optional heading inside the popover (defaults to none: the term is right above it). */
  title?: string;
  className?: string;
}

export default function Term({ children, definition, title, className }: TermProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLSpanElement>(null);
  const popoverId = useId();

  const close = useCallback(() => setOpen(false), []);

  // Place the popover under the term, clamped inside the viewport.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.min(POPOVER_MAX_WIDTH, window.innerWidth - VIEWPORT_GUTTER * 2);
    const left = Math.min(Math.max(rect.left, VIEWPORT_GUTTER), window.innerWidth - VIEWPORT_GUTTER - width);
    setPosition({ top: rect.bottom + 6, left, width });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent): void => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    // Capture so a scroll inside a table container also closes it (the popover is fixed-positioned).
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        aria-describedby={open ? popoverId : undefined}
        onClick={(event) => {
          // A Term can sit inside a clickable row or header; don't trigger it too.
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className={cn(
          // Tailwind's preflight already makes a button inherit font, size, weight and color.
          'inline cursor-help border-0 bg-transparent p-0 text-left',
          'underline decoration-dotted decoration-1 underline-offset-[3px] decoration-muted hover:decoration-primary',
          'focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          className
        )}
      >
        {children}
      </button>
      {open &&
        position &&
        createPortal(
          <span
            ref={popoverRef}
            id={popoverId}
            role="note"
            style={{ top: position.top, left: position.left, width: position.width }}
            className="fixed z-50 block rounded-lg border border-border bg-surface-2 px-3 py-2 text-left text-sm font-normal normal-case leading-snug tracking-normal text-body shadow-lg"
          >
            {title && <span className="mb-1 block font-semibold text-heading">{title}</span>}
            {definition}
          </span>,
          document.body
        )}
    </>
  );
}
