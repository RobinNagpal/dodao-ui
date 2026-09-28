import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const checkoutBar = cva('flex gap-3', {
  variants: {
    layout: {
      /** Note on the left, pay button on the right (stacked on mobile). */
      inline: 'flex-col-reverse sm:flex-row sm:items-center sm:justify-between',
      /** Button above the note, full width — for the narrow modal. */
      stacked: 'flex-col',
    },
  },
  defaultVariants: { layout: 'inline' },
});

export type CheckoutBarProps = VariantProps<typeof checkoutBar> & {
  /** Small print about payment, shown beside (or under) the button. */
  note: React.ReactNode;
  /** The pay button. */
  action: React.ReactNode;
  className?: string;
};

/** The pay button plus its small print, under the credit pack picker. */
export default function CheckoutBar({ note, action, layout, className }: CheckoutBarProps): React.JSX.Element {
  return (
    <div className={cn(checkoutBar({ layout }), className)}>
      {layout === 'stacked' ? (
        <>
          {action}
          <span className="text-xs text-muted">{note}</span>
        </>
      ) : (
        <>
          <span className="max-w-xl text-xs text-muted">{note}</span>
          <span className="shrink-0">{action}</span>
        </>
      )}
    </div>
  );
}
