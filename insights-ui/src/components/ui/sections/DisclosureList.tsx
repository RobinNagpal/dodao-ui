import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Collapsible question/answer list (FAQs). Built on native `<details>` so it
 * needs no client JS and every answer is in the server HTML — collapsed
 * answers stay indexable, which matters for FAQPage structured data.
 */

export function DisclosureList({ children, className }: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return <div className={cn('divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface', className)}>{children}</div>;
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
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-medium text-body transition-colors hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
        <span>{summary}</span>
        <ChevronDownIcon className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="px-5 pb-5 pt-1">{children}</div>
    </details>
  );
}
