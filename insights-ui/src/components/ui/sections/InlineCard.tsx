import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Minimal filled info box (`bg-gray-800 rounded-md`) for small grouped content
 * such as a label + explanation. A lighter-weight surface than `CardSection`.
 */
const inlineCard = cva('bg-surface-2 rounded-md', {
  variants: {
    padding: { snug: 'px-3 py-2', cozy: 'px-3 py-3', roomy: 'p-4', factor: 'px-2 py-4 sm:p-4' },
  },
  defaultVariants: { padding: 'snug' },
});

type InlineCardElement = 'div' | 'li';

export type InlineCardProps = VariantProps<typeof inlineCard> & {
  children: React.ReactNode;
  /** Element to render (e.g. `li` inside a list). Defaults to `div`. */
  as?: InlineCardElement;
  className?: string;
};

export default function InlineCard({ children, padding, as = 'div', className }: InlineCardProps): React.JSX.Element {
  const Tag = as;
  return <Tag className={cn(inlineCard({ padding }), className)}>{children}</Tag>;
}
