import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Outer `<article>` card chrome for a report page (stock + ETF category
 * reports, competition, management-team, stock-movers). Owns the dark surface,
 * border, and responsive padding, plus the schema.org `Article` microdata and
 * the optional `datePublished` meta tag (so SEO can't be omitted per call-site).
 */
const article = cva('bg-surface rounded-lg shadow-sm border border-border', {
  variants: {
    // `default` is the normalized standard; `lg` is the wider competition/mover layout.
    padding: { default: 'p-3 sm:p-6 md:p-8', lg: 'p-6 md:p-8' },
  },
  defaultVariants: { padding: 'default' },
});

export type ReportArticleShellProps = VariantProps<typeof article> & {
  children: React.ReactNode;
  /** schema.org microdata type. */
  schemaType?: 'Article' | 'NewsArticle';
  /** When set, emits a `<meta itemprop="datePublished">` for SEO. */
  datePublished?: Date;
  className?: string;
};

export default function ReportArticleShell({
  children,
  padding,
  schemaType = 'Article',
  datePublished,
  className,
}: ReportArticleShellProps): React.JSX.Element {
  return (
    <div className="py-4">
      <article className={cn(article({ padding }), className)} itemScope itemType={`https://schema.org/${schemaType}`}>
        {datePublished && <meta itemProp="datePublished" content={datePublished.toISOString()} />}
        {children}
      </article>
    </div>
  );
}
