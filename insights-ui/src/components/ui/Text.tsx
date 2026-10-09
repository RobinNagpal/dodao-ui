import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Body / inline text primitive. Centralizes text size, weight, tone (color) and
 * leading so high-level components don't hand-write `text-*`/`text-gray-*`.
 */
const text = cva('', {
  variants: {
    size: { inherit: '', xs: 'text-xs', sm: 'text-sm', base: 'text-base', lg: 'text-lg' },
    weight: { normal: '', medium: 'font-medium', semibold: 'font-semibold', bold: 'font-bold' },
    tone: {
      body: 'text-body',
      muted: 'text-muted',
      subtle: 'text-muted',
      bright: 'text-body',
      white: 'text-heading',
      theme: 'text-body',
      primary: 'text-primary',
    },
    /** `mono` for codes (HTS numbers, program codes). */
    font: { sans: '', mono: 'font-mono' },
    leading: { normal: '', snug: 'leading-snug', relaxed: 'leading-relaxed' },
  },
  defaultVariants: { size: 'sm', weight: 'normal', tone: 'body', font: 'sans', leading: 'normal' },
});

type TextElement = 'p' | 'span' | 'div';

export type TextProps = VariantProps<typeof text> & {
  children: React.ReactNode;
  as?: TextElement;
  /** Optional schema.org itemprop (e.g. `description`). */
  itemProp?: string;
  className?: string;
};

export default function Text({ children, as = 'p', size, weight, tone, font, leading, itemProp, className }: TextProps): React.JSX.Element {
  const Tag = as;
  return (
    <Tag className={cn(text({ size, weight, tone, font, leading }), className)} itemProp={itemProp}>
      {children}
    </Tag>
  );
}
