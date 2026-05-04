import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import Link from 'next/link';
import React, { use } from 'react';

const FULL_REPORT_SLUG = '';

const SECTIONS: ReadonlyArray<{ slug: string; label: string }> = [
  { slug: FULL_REPORT_SLUG, label: 'Full Stock Report' },
  { slug: 'business-and-moat', label: 'Business & Moat' },
  { slug: 'financial-statement-analysis', label: 'Financial Statements' },
  { slug: 'past-performance', label: 'Past Performance' },
  { slug: 'future-performance', label: 'Future Performance' },
  { slug: 'fair-value', label: 'Fair Value' },
  { slug: 'competition', label: 'Competition' },
  { slug: 'management-team', label: 'Management Team' },
];

const CATEGORY_TO_SLUG: Readonly<Record<TickerAnalysisCategory, string>> = {
  [TickerAnalysisCategory.BusinessAndMoat]: 'business-and-moat',
  [TickerAnalysisCategory.FinancialStatementAnalysis]: 'financial-statement-analysis',
  [TickerAnalysisCategory.PastPerformance]: 'past-performance',
  [TickerAnalysisCategory.FutureGrowth]: 'future-performance',
  [TickerAnalysisCategory.FairValue]: 'fair-value',
};

export type AvailableSiblingSlugs = ReadonlySet<string>;

/**
 * Server-side lookup of which sibling stock-detail pages have publishable
 * content for this ticker. Mirrors the per-section sitemap filters so the
 * in-page link graph and the sitemap stay in sync.
 *
 * Call this in a parent server component to kick off the query, then pass the
 * returned Promise to {@link TickerRelatedSections}, wrapped in `<Suspense>`.
 */
export async function getAvailableSiblingSlugs(tickerId: string): Promise<AvailableSiblingSlugs> {
  const [categoryRows, competitionRow, managementRow] = await Promise.all([
    prisma.tickerV1CategoryAnalysisResult.findMany({
      where: {
        spaceId: KoalaGainsSpaceId,
        tickerId,
        summary: { not: '' },
        overallAnalysisDetails: { not: '' },
      },
      select: { categoryKey: true },
    }),
    prisma.tickerV1VsCompetition.findFirst({
      where: { spaceId: KoalaGainsSpaceId, tickerId, overallAnalysisDetails: { not: '' } },
      select: { id: true },
    }),
    prisma.tickerV1ManagementTeamReport.findFirst({
      where: { spaceId: KoalaGainsSpaceId, tickerId, summary: { not: '' }, detailedAnalysis: { not: '' } },
      select: { id: true },
    }),
  ]);

  const available = new Set<string>([FULL_REPORT_SLUG]);
  for (const row of categoryRows) {
    const slug = CATEGORY_TO_SLUG[row.categoryKey as TickerAnalysisCategory];
    if (slug) available.add(slug);
  }
  if (competitionRow) available.add('competition');
  if (managementRow) available.add('management-team');
  return available;
}

export interface TickerRelatedSectionsProps {
  /** Promise returned by {@link getAvailableSiblingSlugs}. Unwrapped with `use()` inside a `<Suspense>` boundary. */
  availableSlugsPromise: Promise<AvailableSiblingSlugs>;
  exchange: string;
  symbol: string;
  companyName: string;
  /** Slug of the current page so it is excluded from the related list (use '' for the parent report). */
  currentSlug: string;
}

export default function TickerRelatedSections({
  availableSlugsPromise,
  exchange,
  symbol,
  companyName,
  currentSlug,
}: TickerRelatedSectionsProps): JSX.Element | null {
  const ex = exchange.toUpperCase();
  const tk = symbol.toUpperCase();
  const available = use(availableSlugsPromise);
  const others = SECTIONS.filter((s) => s.slug !== currentSlug && available.has(s.slug));

  if (others.length === 0) return null;

  return (
    <nav aria-label={`More ${companyName} (${tk}) analyses`} className="mt-10 pt-6 border-t border-color">
      <h2 className="text-lg font-semibold mb-3">
        More {companyName} ({tk}) analyses
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {others.map((s) => {
          const href = s.slug ? `/stocks/${ex}/${tk}/${s.slug}` : `/stocks/${ex}/${tk}`;
          return (
            <li key={s.slug || 'root'}>
              <Link href={href} className="block rounded-md px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white transition-colors">
                {companyName} ({tk}) {s.label} →
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
