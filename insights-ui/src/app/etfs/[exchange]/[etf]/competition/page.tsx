import { EtfFastResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/route';
import EtfCompetitionFullView from '@/components/etf-reportsv1/EtfCompetitionFullView';
import { fetchEtfAvailableSlugs } from '@/components/etf-reportsv1/EtfRelatedSections';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import type { EtfCompetitionResponse } from '@/types/etf/etf-analysis-types';
import { etfCompetitionTag } from '@/utils/etf-cache-utils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { buildEtfReportSubpageBreadcrumbs } from '@/utils/etf-breadcrumbs-utils';
import { generateBreadcrumbJsonLdFromCrumbs } from '@/utils/etf-metadata-generators';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

/** Static-by-default with on-demand invalidation (matches the ETF detail page). */
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;

export type RouteParams = Promise<Readonly<{ exchange: string; etf: string }>>;

const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

async function fetchEtfCompetition(exchange: string, etf: string): Promise<EtfCompetitionResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange.toUpperCase()}/${etf.toUpperCase()}/competition`;
  const res = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [etfCompetitionTag(etf, exchange)] } });
  if (!res.ok) return null;
  return (await res.json()) as EtfCompetitionResponse | null;
}

async function fetchEtfFast(exchange: string, etf: string): Promise<EtfFastResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange.toUpperCase()}/${etf.toUpperCase()}?allowNull=true`;
  try {
    const res = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [etfCompetitionTag(etf, exchange)] } });
    if (!res.ok) return null;
    return (await res.json()) as EtfFastResponse | null;
  } catch {
    return null;
  }
}

function truncateForMeta(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { exchange, etf } = await params;
  const exchangeUpper = exchange.toUpperCase();
  const etfUpper = etf.toUpperCase();

  let etfName = etfUpper;
  try {
    const data = await fetchEtfCompetition(exchangeUpper, etfUpper);
    etfName = data?.etf?.name ?? etfName;
  } catch {
    /* keep generic */
  }

  const year = new Date().getFullYear();
  const shortDesc = truncateForMeta(
    `Peer-vs-peer competitive analysis of ${etfName} (${etfUpper}). Compare against its closest peer ETFs on past returns, future outlook, cost efficiency, and risk.`
  );
  const canonicalUrl = `https://koalagains.com/etfs/${exchangeUpper}/${etfUpper}/competition`;

  return {
    title: `${etfName} (${etfUpper}) Competitive Analysis & Peer Comparison (${year})`,
    description: shortDesc,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${etfName} (${etfUpper}) Competitive Analysis | KoalaGains`,
      description: shortDesc,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${etfName} (${etfUpper}) Competitive Analysis | KoalaGains`,
      description: shortDesc,
      site: '@koalagains',
      creator: '@koalagains',
    },
  };
}

export default async function EtfCompetitionPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const { exchange, etf } = await params;
  const exchangeUpper = exchange.toUpperCase();
  const etfUpper = etf.toUpperCase();

  const [data, availableSlugs, etfFast] = await Promise.all([
    fetchEtfCompetition(exchangeUpper, etfUpper),
    fetchEtfAvailableSlugs(exchangeUpper, etfUpper),
    fetchEtfFast(exchangeUpper, etfUpper),
  ]);
  if (!data || !data.etf) {
    notFound();
  }

  const breadcrumbs = buildEtfReportSubpageBreadcrumbs({
    exchange: exchangeUpper,
    symbol: etfUpper,
    fundCategory: etfFast?.stockAnalyzerInfo?.category ?? null,
    sectionName: 'Competition',
    sectionSlug: 'competition',
  });
  const breadcrumbJsonLd = generateBreadcrumbJsonLdFromCrumbs(breadcrumbs);

  return (
    <PageWrapper>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} />
      <EtfCompetitionFullView data={data} availableSlugs={availableSlugs} />
    </PageWrapper>
  );
}
