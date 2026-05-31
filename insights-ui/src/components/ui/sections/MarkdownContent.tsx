import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Renders pre-sanitized markdown HTML with the project's markdown styling.
 * Centralizes the `markdown markdown-body …` class recipes that report
 * sections otherwise hand-write next to every `dangerouslySetInnerHTML`.
 *
 * - `summary` — the executive-summary body (`text-body leading-relaxed`).
 * - `body` — full prose-styled analysis body.
 * - `plain` — bare markdown body (e.g. per-factor detail).
 */
const markdown = cva('', {
  variants: {
    variant: {
      summary: 'text-body leading-relaxed',
      body: 'markdown markdown-body prose-headings:text-body prose-p:text-body prose-strong:text-body prose-code:text-body prose-a:text-primary hover:prose-a:text-primary/80',
      plain: 'markdown markdown-body',
    },
  },
  defaultVariants: { variant: 'plain' },
});

export type MarkdownContentProps = VariantProps<typeof markdown> & {
  /** Pre-rendered, sanitized HTML (e.g. from `parseMarkdown`). */
  html: string;
  /** Optional schema.org itemprop (e.g. `abstract`). */
  itemProp?: string;
  className?: string;
};

export default function MarkdownContent({ html, variant, itemProp, className }: MarkdownContentProps): React.JSX.Element {
  return <div className={cn(markdown({ variant }), className)} itemProp={itemProp} dangerouslySetInnerHTML={{ __html: html }} />;
}
