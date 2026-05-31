import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Flex layout primitive. Owns spacing (gap + optional block margins) so that
 * high-level components never hand-write `flex`, `gap-*`, or `m*-*` Tailwind.
 *
 * The spacing scale is intentionally small and semantic; extend the variant
 * maps here (the single source of truth) rather than inlining Tailwind upstream.
 */
const stack = cva('flex', {
  variants: {
    direction: { col: 'flex-col', row: 'flex-row' },
    gap: {
      none: 'gap-0',
      xxs: 'gap-0.5',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-6',
      '2xl': 'gap-8',
    },
    align: { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch', baseline: 'items-baseline' },
    justify: { start: 'justify-start', center: 'justify-center', between: 'justify-between', end: 'justify-end' },
    wrap: { true: 'flex-wrap', false: '' },
    mt: { none: '', sm: 'mt-2', md: 'mt-3', lg: 'mt-4', xl: 'mt-6' },
    mb: { none: '', sm: 'mb-2', md: 'mb-4', lg: 'mb-6' },
  },
  defaultVariants: { direction: 'col', gap: 'none', wrap: false, mt: 'none', mb: 'none' },
});

type StackElement = 'div' | 'ul' | 'ol' | 'section' | 'header' | 'footer';

export type StackProps = VariantProps<typeof stack> & {
  children: React.ReactNode;
  /** Element to render (e.g. `ul` for a flex list). Defaults to `div`. */
  as?: StackElement;
  className?: string;
};

export default function Stack({ children, className, as = 'div', direction, gap, align, justify, wrap, mt, mb }: StackProps): React.JSX.Element {
  const Tag = as;
  return <Tag className={cn(stack({ direction, gap, align, justify, wrap, mt, mb }), className)}>{children}</Tag>;
}
