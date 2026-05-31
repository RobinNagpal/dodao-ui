import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * A `<section>` with standardized vertical rhythm between report blocks
 * (`mb-6` is the dominant default). Optional `itemProp` for schema.org
 * microdata (e.g. `articleBody`).
 */
const reportSection = cva('', {
  variants: { spacing: { md: 'mb-6', lg: 'mb-8', none: '' } },
  defaultVariants: { spacing: 'md' },
});

export type ReportSectionProps = VariantProps<typeof reportSection> & {
  children: React.ReactNode;
  itemProp?: string;
  /** Optional anchor id (e.g. for in-page navigation). */
  id?: string;
  className?: string;
};

export default function ReportSection({ children, spacing, itemProp, id, className }: ReportSectionProps): React.JSX.Element {
  return (
    <section id={id} className={cn(reportSection({ spacing }), className)} itemProp={itemProp}>
      {children}
    </section>
  );
}
