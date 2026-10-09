import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Collapsible question/answer list (FAQs). Built on native `<details>` so it
 * needs no client JS and every answer is in the server HTML — collapsed
 * answers stay indexable, which matters for FAQPage structured data.
 * Rows are separated by rules and sit directly on the surrounding card.
 */

export function DisclosureList({ children, className }: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return <div className={cn('divide-y divide-border border-y border-border', className)}>{children}</div>;
}

export type DisclosureItemProps = {
  /** Always-visible summary line, e.g. the question. */
  summary: React.ReactNode;
  children: React.ReactNode;
  /** Render expanded on first load. */
  defaultOpen?: boolean;
  id?: string;
  className?: string;
};

export function DisclosureItem({ summary, children, defaultOpen, id, className }: DisclosureItemProps): React.JSX.Element {
  return (
    <details id={id} open={defaultOpen} className={cn('group scroll-mt-24', className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-1 py-4 text-left text-base font-semibold text-heading transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
        <span>{summary}</span>
        <ChevronDownIcon className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="max-w-4xl px-1 pb-5">{children}</div>
    </details>
  );
}
