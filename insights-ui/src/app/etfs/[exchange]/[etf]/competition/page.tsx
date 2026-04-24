import EtfCompetitionFullView from '@/components/etf-reportsv1/EtfCompetitionFullView';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import type { EtfCompetitionResponse } from '@/types/etf/etf-analysis-types';
import { etfAndExchangeTag } from '@/utils/etf-cache-utils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { getCountryByExchange, SupportedCountries, toExchange } from '@/utils/countryExchangeUtils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
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
  const res = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [etfAndExchangeTag(etf, exchange)] } });
  if (!res.ok) return null;
  return (await res.json()) as EtfCompetitionResponse | null;
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

  const data = await fetchEtfCompetition(exchangeUpper, etfUpper);
  if (!data || !data.etf) {
    notFound();
  }

  const country: SupportedCountries = getCountryByExchange(toExchange(data.etf.exchange));

  const breadcrumbs: BreadcrumbsOjbect[] =
    country === SupportedCountries.US
      ? [
          { name: 'US ETFs', href: `/etfs`, current: false },
          { name: etfUpper, href: `/etfs/${exchangeUpper}/${etfUpper}`, current: false },
          { name: 'Competition', href: `/etfs/${exchangeUpper}/${etfUpper}/competition`, current: true },
        ]
      : country
      ? [
          { name: `${country} ETFs`, href: `/etfs/countries/${country}`, current: false },
          { name: etfUpper, href: `/etfs/${exchangeUpper}/${etfUpper}`, current: false },
          { name: 'Competition', href: `/etfs/${exchangeUpper}/${etfUpper}/competition`, current: true },
        ]
      : [
          { name: 'ETFs', href: `/etfs`, current: false },
          { name: etfUpper, href: `/etfs/${exchangeUpper}/${etfUpper}`, current: false },
          { name: 'Competition', href: `/etfs/${exchangeUpper}/${etfUpper}/competition`, current: true },
        ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} />
      <EtfCompetitionFullView data={data} />
    </PageWrapper>
  );
}
