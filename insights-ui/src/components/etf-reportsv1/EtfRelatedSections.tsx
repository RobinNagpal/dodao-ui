import { prisma } from '@/prisma';
import { getEtfWhereClause } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import RelatedSectionsNav from '@/components/ui/sections/RelatedSectionsNav';
import { use } from 'react';

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
 *
 * Kick this off in a parent server component (without `await`) and pass the
 * returned Promise to {@link EtfRelatedSections}, wrapped in `<Suspense>`. The
 * sibling lookup then runs in parallel with the rest of the report render.
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

const SLUG_TO_ANALYSIS_CATEGORY: Readonly<Record<string, EtfAnalysisCategory>> = Object.fromEntries(
  Object.entries(ANALYSIS_CATEGORY_TO_SLUG).map(([category, slug]) => [slug, category as EtfAnalysisCategory])
);

/** Stable `SYMBOL|EXCHANGE` key for peer-availability lookups. */
export function etfPeerKey(peer: { symbol: string; exchange: string }): string {
  return `${peer.symbol.toUpperCase()}|${peer.exchange.toUpperCase()}`;
}

/**
 * Bulk variant of {@link fetchEtfAvailableSlugs}: given a list of *peer* ETFs and
 * a single sub-report slug, returns the {@link etfPeerKey}s that actually have
 * publishable content for that slug.
 *
 * The "Similar ETFs" table links every peer to the same sub-report the reader is
 * on; a peer without that report renders the not-found page, which Google logs
 * as "Excluded by 'noindex' tag". Peers missing from this set link to their main
 * ETF page instead. Same predicates as `fetchEtfAvailableSlugs` and the
 * per-category sitemaps, so the link graph and the sitemap stay in sync.
 */
export async function filterEtfPeersWithSlug(peers: ReadonlyArray<{ symbol: string; exchange: string }>, slug: string): Promise<ReadonlySet<string>> {
  if (peers.length === 0) return new Set<string>();

  const etfRecords = await prisma.etf.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      OR: peers.map((peer) => ({ symbol: peer.symbol, exchange: peer.exchange })),
    },
    select: { id: true, symbol: true, exchange: true },
  });
  if (etfRecords.length === 0) return new Set<string>();

  const keyByEtfId = new Map(etfRecords.map((record) => [record.id, etfPeerKey(record)]));
  const etfIds = Array.from(keyByEtfId.keys());

  const withReport = async (): Promise<string[]> => {
    if (slug === 'holdings') {
      const rows = await prisma.etfMorPortfolioInfo.findMany({ where: { etfId: { in: etfIds } }, select: { etfId: true } });
      return rows.map((row) => row.etfId);
    }
    if (slug === 'competition') {
      const rows = await prisma.etfVsCompetition.findMany({
        where: { spaceId: KoalaGainsSpaceId, etfId: { in: etfIds }, overallAnalysisDetails: { not: '' } },
        select: { etfId: true },
      });
      return rows.map((row) => row.etfId);
    }
    const categoryKey = SLUG_TO_ANALYSIS_CATEGORY[slug];
    if (!categoryKey) return [];
    const rows = await prisma.etfCategoryAnalysisResult.findMany({
      where: {
        spaceId: KoalaGainsSpaceId,
        etfId: { in: etfIds },
        categoryKey,
        summary: { not: '' },
        overallAnalysisDetails: { not: '' },
      },
      select: { etfId: true },
    });
    return rows.map((row) => row.etfId);
  };

  const available = new Set<string>();
  for (const etfId of await withReport()) {
    const key = keyByEtfId.get(etfId);
    if (key) available.add(key);
  }
  return available;
}

export interface EtfRelatedSectionsProps {
  /** Promise returned by {@link fetchEtfAvailableSlugs}. Unwrapped with `use()` inside a `<Suspense>` boundary. */
  availableSlugsPromise: Promise<string[]>;
  exchange: string;
  symbol: string;
  etfName: string;
  /** Slug of the current sibling page so it is excluded from the related list. */
  currentSlug: string;
}

export default function EtfRelatedSections({ availableSlugsPromise, exchange, symbol, etfName, currentSlug }: EtfRelatedSectionsProps): JSX.Element | null {
  const ex = exchange.toUpperCase();
  const sym = symbol.toUpperCase();
  const available = new Set(use(availableSlugsPromise));
  const others = SECTIONS.filter((s) => s.slug !== currentSlug && available.has(s.slug));

  if (others.length === 0) return null;

  return (
    <RelatedSectionsNav
      ariaLabel={`More ${etfName} (${sym}) analyses`}
      heading={
        <>
          More {etfName} ({sym}) analyses
        </>
      }
      items={others.map((s) => ({ href: `/etfs/${ex}/${sym}/${s.slug}`, label: `${s.label} →` }))}
    />
  );
}
