import { prisma } from '@/prisma';
import { getEtfWhereClause } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import Link from 'next/link';

const SECTIONS: ReadonlyArray<{ slug: string; label: string }> = [
  { slug: 'performance-returns', label: 'Past Returns' },
  { slug: 'cost-efficiency-team', label: 'Cost & Team' },
  { slug: 'risk-analysis', label: 'Risk Analysis' },
  { slug: 'future-performance-outlook', label: 'Future Outlook' },
  { slug: 'competition', label: 'Competition' },
  { slug: 'holdings', label: 'Holdings' },
];

const ANALYSIS_CATEGORY_TO_SLUG: Readonly<Record<string, string>> = {
  [EtfAnalysisCategory.PerformanceAndReturns]: 'performance-returns',
  [EtfAnalysisCategory.CostEfficiencyAndTeam]: 'cost-efficiency-team',
  [EtfAnalysisCategory.RiskAnalysis]: 'risk-analysis',
  [EtfAnalysisCategory.FuturePerformanceOutlook]: 'future-performance-outlook',
};

/**
 * Server-side helper for ETF detail/category pages. Hits Prisma directly so the
 * call rides the per-page ISR cache (no separate fetch-cache entry → no shared
 * cache tag that would force all subpages to invalidate together). Mirrors the
 * stocks-side `getAvailableSiblingSlugs` in `TickerRelatedSections.tsx`.
 */
export async function fetchEtfAvailableSlugs(exchange: string, symbol: string): Promise<string[]> {
  const where = getEtfWhereClause({ spaceId: KoalaGainsSpaceId, exchange, etf: symbol });
  if (!where.symbol || !where.exchange) return [];

  const etfRecord = await prisma.etf.findFirst({ where, select: { id: true } });
  if (!etfRecord) return [];

  const [analysisRows, competitionRow, holdingsRow] = await Promise.all([
    prisma.etfCategoryAnalysisResult.findMany({
      where: {
        spaceId: KoalaGainsSpaceId,
        etfId: etfRecord.id,
        summary: { not: '' },
        overallAnalysisDetails: { not: '' },
      },
      select: { categoryKey: true },
    }),
    prisma.etfVsCompetition.findFirst({
      where: { spaceId: KoalaGainsSpaceId, etfId: etfRecord.id, overallAnalysisDetails: { not: '' } },
      select: { id: true },
    }),
    prisma.etfMorPortfolioInfo.findFirst({
      where: { etfId: etfRecord.id },
      select: { id: true },
    }),
  ]);

  const available = new Set<string>();
  for (const row of analysisRows) {
    const slug = ANALYSIS_CATEGORY_TO_SLUG[row.categoryKey as string];
    if (slug) available.add(slug);
  }
  if (competitionRow) available.add('competition');
  if (holdingsRow) available.add('holdings');

  return Array.from(available);
}

export interface EtfRelatedSectionsProps {
  /** Slugs known to have publishable content; resolved upstream so this stays a sync render. */
  availableSlugs: string[];
  exchange: string;
  symbol: string;
  etfName: string;
  /** Slug of the current sibling page so it is excluded from the related list. */
  currentSlug: string;
}

export default function EtfRelatedSections({ availableSlugs, exchange, symbol, etfName, currentSlug }: EtfRelatedSectionsProps): JSX.Element | null {
  const ex = exchange.toUpperCase();
  const sym = symbol.toUpperCase();
  const available = new Set(availableSlugs);
  const others = SECTIONS.filter((s) => s.slug !== currentSlug && available.has(s.slug));

  if (others.length === 0) return null;

  return (
    <nav aria-label={`More ${etfName} (${sym}) analyses`} className="mt-10 pt-6 border-t border-color">
      <h2 className="text-lg font-semibold mb-3">
        More {etfName} ({sym}) analyses
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {others.map((s) => (
          <li key={s.slug} className="h-full">
            <Link
              href={`/etfs/${ex}/${sym}/${s.slug}`}
              prefetch={false}
              className="flex h-full items-center rounded-md px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white transition-colors"
            >
              {s.label} &rarr;
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
