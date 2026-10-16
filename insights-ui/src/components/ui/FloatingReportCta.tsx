'use client';

import { cn } from '@/lib/utils';
import { ArrowLeftIcon, ArrowPathIcon, ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type FloatingReportCtaIcon = 'sparkles' | 'forward' | 'back';

interface FloatingReportCtaBaseProps {
  /** The headline on the pill, e.g. "Get the latest analysis". */
  label: string;
  /** Smaller second line, e.g. how stale the report is. */
  subLabel?: string | null;
  /** `sparkles` (default) and `back` sit before the text; `forward` is an arrow after it. */
  icon?: FloatingReportCtaIcon;
  className?: string;
}

/** An action on the page (opens a modal, starts a run). */
interface FloatingReportCtaButtonProps extends FloatingReportCtaBaseProps {
  onClick: () => void;
  loading?: boolean;
  href?: never;
}

/** Navigation to another page, rendered as a real link so it can be opened in a new tab. */
interface FloatingReportCtaLinkProps extends FloatingReportCtaBaseProps {
  href: string;
  onClick?: never;
  loading?: never;
}

export type FloatingReportCtaProps = FloatingReportCtaButtonProps | FloatingReportCtaLinkProps;

const PILL_CLASSES =
  'fixed bottom-5 left-1/2 z-[9] hidden -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-4 py-2 text-left text-primary-text shadow-lg ring-1 ring-primary/40 transition-transform duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 md:inline-flex';

const ICON_CLASSES = 'h-4 w-4 shrink-0';

/**
 * Attention-grabbing call to action pinned to the bottom centre of the viewport,
 * visible as soon as the report opens. Either a button (`onClick`, e.g. the
 * stock/ETF "Get the latest analysis") or a link (`href`, e.g. the tariff
 * chapter's switch between its import and export pages).
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
 * so callers give phones an inline control instead. Bottom-centre keeps it
 * clear of the bottom-right theme toggle.
 *
 * Stacking: it sits at `z-[9]`, just under the shared `FullPageModal` (web-core),
 * whose Headless UI dialog is portaled to `<body>` as `relative z-10`. The pill
 * must stay below 10 so every such modal (login popup, favourites, filters…)
 * covers it; the other overlays (`z-40`/`z-50` backdrops, drawers, toasts) cover
 * it too. The modal's z-index is not raised instead because it is shared with
 * the other apps.
 */
export default function FloatingReportCta(props: FloatingReportCtaProps): React.JSX.Element | null {
  const { label, subLabel, icon = 'sparkles', className } = props;
  // `document` only exists in the browser, so the portal is created after mount.
  // The pill is `fixed`, so arriving a tick late can't shift any layout.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  const loading = props.loading ?? false;
  const leadingIcon = loading ? (
    <ArrowPathIcon className={cn(ICON_CLASSES, 'animate-spin')} aria-hidden="true" />
  ) : icon === 'sparkles' ? (
    <SparklesIcon className={ICON_CLASSES} aria-hidden="true" />
  ) : icon === 'back' ? (
    <ArrowLeftIcon className={ICON_CLASSES} aria-hidden="true" />
  ) : null;

  const content = (
    <>
      {leadingIcon}
      <span className="flex flex-col">
        <span className="text-xs font-semibold leading-tight">{loading ? 'Starting…' : label}</span>
        {subLabel && <span className="text-[11px] leading-tight opacity-80">{subLabel}</span>}
      </span>
      {icon === 'forward' && !loading && <ArrowRightIcon className={ICON_CLASSES} aria-hidden="true" />}
    </>
  );

  const pill =
    props.href !== undefined ? (
      <Link href={props.href} prefetch={false} className={cn(PILL_CLASSES, className)}>
        {content}
      </Link>
    ) : (
      <button type="button" onClick={props.onClick} disabled={loading} className={cn(PILL_CLASSES, className)}>
        {content}
      </button>
    );

  return createPortal(pill, document.body);
}
