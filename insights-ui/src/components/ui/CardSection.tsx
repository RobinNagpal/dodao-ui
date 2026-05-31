import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Dark "report section" surface (`bg-gray-900 rounded-lg shadow-sm`) with
 * preset padding. Use instead of hand-writing the card chrome on report
 * sections (financial info, holdings, competition, etc.).
 */
const cardSection = cva('bg-gray-900 rounded-lg shadow-sm', {
  variants: {
    padding: { compact: 'px-2 py-2 sm:p-3', normal: 'px-3 py-6 sm:p-6', flush: '' },
    mt: { none: '', md: 'mt-6' },
    mb: { none: '', lg: 'mb-8' },
  },
  defaultVariants: { padding: 'normal', mt: 'none', mb: 'none' },
});

export type CardSectionProps = VariantProps<typeof cardSection> & {
  children: React.ReactNode;
  /** Optional anchor id (e.g. for in-page navigation). */
  id?: string;
  className?: string;
};

export default function CardSection({ children, id, padding, mt, mb, className }: CardSectionProps): React.JSX.Element {
  return (
    <section id={id} className={cn(cardSection({ padding, mt, mb }), className)}>
      {children}
    </section>
  );
}
