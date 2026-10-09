import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Collapsible question/answer list (FAQs). Built on native `<details>` so it
 * needs no client JS and every answer is in the server HTML — collapsed
 * answers stay indexable, which matters for FAQPage structured data.
 * Rows are separated by rules and sit directly on the surrounding card.
 *
 * `look="inline"` is the small "show details" toggle inside a card: a muted
 * summary line that folds secondary detail away, with no rules around it.
 */

export function DisclosureList({ children, className }: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return <div className={cn('divide-y divide-border border-y border-border', className)}>{children}</div>;
}

const summaryStyle = cva('flex cursor-pointer list-none items-center justify-between gap-4 text-left transition-colors [&::-webkit-details-marker]:hidden', {
  variants: {
    look: {
      faq: 'px-1 py-4 text-base font-semibold text-heading hover:text-primary',
      inline: 'w-fit py-1 text-sm font-medium text-muted hover:text-heading',
    },
  },
  defaultVariants: { look: 'faq' },
});

const bodyStyle = cva('', {
  variants: { look: { faq: 'max-w-4xl px-1 pb-5', inline: 'pt-2' } },
  defaultVariants: { look: 'faq' },
});

export type DisclosureItemProps = VariantProps<typeof summaryStyle> & {
  /** Always-visible summary line, e.g. the question. */
  summary: React.ReactNode;
  children: React.ReactNode;
  /** Render expanded on first load. */
  defaultOpen?: boolean;
  id?: string;
  className?: string;
};

export function DisclosureItem({ summary, children, defaultOpen, id, look, className }: DisclosureItemProps): React.JSX.Element {
  return (
    <details id={id} open={defaultOpen} className={cn('group scroll-mt-24', className)}>
      <summary className={summaryStyle({ look })}>
        <span>{summary}</span>
        <ChevronDownIcon
          className={cn('shrink-0 text-muted transition-transform group-open:rotate-180', look === 'inline' ? 'h-4 w-4' : 'h-5 w-5')}
          aria-hidden="true"
        />
      </summary>
      <div className={bodyStyle({ look })}>{children}</div>
    </details>
  );
}
