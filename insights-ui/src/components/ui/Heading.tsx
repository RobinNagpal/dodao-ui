import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Semantic heading primitive. `as` controls the element (h1–h6) independently
 * of the visual `size`, so high-level components never hand-write
 * `text-*`/`font-*`/`text-gray-*` for headings.
 */
const heading = cva('', {
  variants: {
    size: { inherit: '', xs: 'text-xs', sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl', '2xl': 'text-2xl' },
    weight: { medium: 'font-medium', semibold: 'font-semibold', bold: 'font-bold' },
    tone: { inherit: '', default: 'text-gray-100', bright: 'text-gray-200', white: 'text-white', muted: 'text-gray-400', themed: 'text-body' },
  },
  defaultVariants: { size: 'lg', weight: 'semibold', tone: 'default' },
});

type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type HeadingProps = VariantProps<typeof heading> & {
  children: React.ReactNode;
  as?: HeadingElement;
  className?: string;
};

export default function Heading({ children, as = 'h2', size, weight, tone, className }: HeadingProps): React.JSX.Element {
  const Tag = as;
  return <Tag className={cn(heading({ size, weight, tone }), className)}>{children}</Tag>;
}
