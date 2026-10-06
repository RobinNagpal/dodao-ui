'use client';

import { cn } from '@/lib/utils';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface FloatingReportCtaProps {
  /** The headline on the pill, e.g. "Get the latest analysis". */
  label: string;
  /** Smaller second line, e.g. how stale the report is. */
  subLabel?: string | null;
  onClick: () => void;
  loading?: boolean;
  className?: string;
}

/**
 * Attention-grabbing call to action pinned to the bottom centre of the viewport,
 * visible as soon as the report opens.
 *
 * Rendered through a portal into `document.body` rather than in place. A
 * `position: fixed` element is positioned against the viewport *only* while no
 * ancestor establishes a containing block — any ancestor with a `transform`,
 * `filter`, `backdrop-filter`, `perspective` or `contain` (Headless UI
 * transitions and chart wrappers add these) silently re-anchors it to that
 * ancestor's box, which stranded this pill in the middle of the ETF report.
 * As a direct child of `<body>` it cannot be captured by anything on the page.
 *
 * Tablet and up only (`hidden md:inline-flex`): on a phone a bar across the
 * bottom would cover the report itself and collide with the mobile action icons,
 * and those visitors already have the inline button. Bottom-centre keeps it
 * clear of the bottom-right theme toggle.
 *
 * Stacking: it sits at `z-[9]`, just under the shared `FullPageModal` (web-core),
 * whose Headless UI dialog is portaled to `<body>` as `relative z-10`. The pill
 * must stay below 10 so every such modal (login popup, favourites, filters…)
 * covers it; the other overlays (`z-40`/`z-50` backdrops, drawers, toasts) cover
 * it too. The modal's z-index is not raised instead because it is shared with
 * the other apps.
 */
export default function FloatingReportCta({ label, subLabel, onClick, loading, className }: FloatingReportCtaProps): React.JSX.Element | null {
  // `document` only exists in the browser, so the portal is created after mount.
  // The pill is `fixed`, so arriving a tick late can't shift any layout.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        'fixed bottom-5 left-1/2 z-[9] hidden -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-4 py-2 text-left text-primary-text shadow-lg ring-1 ring-primary/40 transition-transform duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 md:inline-flex',
        className
      )}
    >
      {loading ? (
        <ArrowPathIcon className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        <SparklesIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span className="flex flex-col">
        <span className="text-xs font-semibold leading-tight">{loading ? 'Starting…' : label}</span>
        {subLabel && <span className="text-[11px] leading-tight opacity-80">{subLabel}</span>}
      </span>
    </button>,
    document.body
  );
}
