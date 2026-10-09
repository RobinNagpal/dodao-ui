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
      /** Amber, for values a reader should spot (e.g. a high tariff rate). */
      warning: 'text-tariff-accent',
    },
    /** `mono` for codes (HTS numbers, program codes). */
    font: { sans: '', mono: 'font-mono' },
    leading: { normal: '', snug: 'leading-snug', relaxed: 'leading-relaxed' },
    /** `narrow` keeps a short caption beside a control from stretching across the row. */
    maxWidth: { none: '', narrow: 'max-w-60' },
  },
  defaultVariants: { size: 'sm', weight: 'normal', tone: 'body', font: 'sans', leading: 'normal', maxWidth: 'none' },
});

type TextElement = 'p' | 'span' | 'div';

export type TextProps = VariantProps<typeof text> & {
  children: React.ReactNode;
  as?: TextElement;
  /** Optional schema.org itemprop (e.g. `description`). */
  itemProp?: string;
  className?: string;
};

export default function Text({ children, as = 'p', size, weight, tone, font, leading, maxWidth, itemProp, className }: TextProps): React.JSX.Element {
  const Tag = as;
  return (
    <Tag className={cn(text({ size, weight, tone, font, leading, maxWidth }), className)} itemProp={itemProp}>
      {children}
    </Tag>
  );
}
