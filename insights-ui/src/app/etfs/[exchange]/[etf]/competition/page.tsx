import { EtfFastResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/route';
import EtfCompetitionFullView from '@/components/etf-reportsv1/EtfCompetitionFullView';
import { fetchEtfAvailableSlugs } from '@/components/etf-reportsv1/EtfRelatedSections';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import type { EtfCompetitionResponse } from '@/types/etf/etf-analysis-types';
import { etfCompetitionTag } from '@/utils/etf-cache-utils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { buildEtfReportSubpageBreadcrumbs } from '@/utils/etf-breadcrumbs-utils';
import { generateBreadcrumbJsonLdFromCrumbs, generateEtfCompetitionArticleJsonLd, generateEtfCompetitionMetadata } from '@/utils/etf-metadata-generators';
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

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { exchange, etf } = await params;
  const exchangeUpper = exchange.toUpperCase();
  const etfUpper = etf.toUpperCase();

  let etfName = etfUpper;
  let createdTime: string | undefined;
  let updatedTime: string | undefined;
  try {
    const [competition, fast] = await Promise.all([fetchEtfCompetition(exchangeUpper, etfUpper), fetchEtfFast(exchangeUpper, etfUpper)]);
    etfName = competition?.etf?.name ?? fast?.name ?? etfName;
    createdTime = fast?.createdAt?.toISOString();
    updatedTime = fast?.updatedAt?.toISOString();
  } catch {
    /* keep generic */
  }

  return generateEtfCompetitionMetadata({ etfName, symbol: etfUpper, exchange: exchangeUpper, createdTime, updatedTime });
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

  const safeDate = (val: unknown): Date => {
    if (val instanceof Date && !isNaN(val.getTime())) return val;
    if (typeof val === 'string' && val.trim()) {
      const parsed = new Date(val);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  };
  const publishedDate = safeDate(data.vsCompetition?.createdAt ?? etfFast?.createdAt).toISOString();
  const modifiedDate = safeDate(data.vsCompetition?.updatedAt ?? etfFast?.updatedAt).toISOString();
  const articleJsonLd = generateEtfCompetitionArticleJsonLd({
    etfName: data.etf.name,
    symbol: etfUpper,
    exchange: exchangeUpper,
    publishedDate,
    modifiedDate,
  });

  return (
    <PageWrapper>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd]) }} />
      <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} />
      <EtfCompetitionFullView data={data} availableSlugs={availableSlugs} />
    </PageWrapper>
  );
}
