import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Minimal filled info box (`bg-gray-800 rounded-md`) for small grouped content
 * such as a label + explanation. A lighter-weight surface than `CardSection`.
 */
const inlineCard = cva('bg-gray-800 rounded-md', {
  variants: {
    padding: { snug: 'px-3 py-2', cozy: 'px-3 py-3', roomy: 'p-4' },
  },
  defaultVariants: { padding: 'snug' },
});

export type InlineCardProps = VariantProps<typeof inlineCard> & {
  children: React.ReactNode;
  className?: string;
};

export default function InlineCard({ children, padding, className }: InlineCardProps): React.JSX.Element {
  return <div className={cn(inlineCard({ padding }), className)}>{children}</div>;
}
