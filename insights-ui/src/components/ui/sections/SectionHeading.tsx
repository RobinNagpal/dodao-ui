import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * In-article section heading (the `text-xl font-semibold text-body mb-3` H2
 * repeated ~18× across report sections). `bordered` covers the "Summary
 * Analysis"-style header with an underline (normalized to `border-border`).
 */
const sectionHeading = cva('', {
  variants: {
    size: { lg: 'text-2xl', md: 'text-xl', sm: 'text-lg' },
    tone: { body: 'text-body', heading: 'text-heading' },
    weight: { semibold: 'font-semibold', bold: 'font-bold' },
    bordered: { true: 'mb-4 pb-2 border-b border-border', false: 'mb-3' },
  },
  defaultVariants: { size: 'md', tone: 'body', weight: 'semibold', bordered: false },
});

type HeadingElement = 'h2' | 'h3' | 'h4';

export type SectionHeadingProps = VariantProps<typeof sectionHeading> & {
  children: React.ReactNode;
  as?: HeadingElement;
  className?: string;
};

export default function SectionHeading({ children, as = 'h2', size, tone, weight, bordered, className }: SectionHeadingProps): React.JSX.Element {
  const Tag = as;
  return <Tag className={cn(sectionHeading({ size, tone, weight, bordered }), className)}>{children}</Tag>;
}
