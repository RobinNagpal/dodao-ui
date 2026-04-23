import { EtfPortfolioHoldingsResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/portfolio-holdings/route';
import { EtfFastResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/route';
import EtfHoldings from '@/components/etf-reportsv1/EtfHoldings';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { etfAndExchangeTag } from '@/utils/etf-cache-utils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;

type RouteParams = Promise<Readonly<{ exchange: string; etf: string }>>;

const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

async function fetchEtf(exchange: string, etf: string): Promise<EtfFastResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange}/${etf}?allowNull=true`;
  const res = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [etfAndExchangeTag(etf, exchange)] } });
  if (!res.ok) return null;
  return (await res.json()) as EtfFastResponse | null;
}

async function fetchHoldings(exchange: string, etf: string): Promise<EtfPortfolioHoldingsResponse['holdings']> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange}/${etf}/portfolio-holdings`;
  try {
    const res = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [etfAndExchangeTag(etf, exchange)] } });
    if (!res.ok) return null;
    const wrapper = (await res.json()) as EtfPortfolioHoldingsResponse;
    return wrapper.holdings;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { exchange: rawExchange, etf: rawEtf } = await params;
  const exchange = rawExchange.toUpperCase();
  const symbol = rawEtf.toUpperCase();

  let etfName = symbol;
  try {
    const data = await fetchEtf(exchange, symbol);
    if (data) etfName = data.name ?? etfName;
  } catch {
    /* keep generic */
  }

  const title = `${etfName} (${symbol}) Holdings`;
  return {
    title,
    description: `Full list of holdings for ${etfName} (${symbol}) ETF, including portfolio weights and sector exposure.`,
    alternates: { canonical: `/etfs/${exchange}/${symbol}/holdings` },
  };
}

export default async function EtfHoldingsPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const { exchange: rawExchange, etf: rawEtf } = await params;
  const exchange = rawExchange.toUpperCase();
  const symbol = rawEtf.toUpperCase();

  const [etfData, holdings] = await Promise.all([fetchEtf(exchange, symbol), fetchHoldings(exchange, symbol)]);
  if (!etfData) notFound();

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'US ETFs', href: '/etfs', current: false },
    { name: `${etfData.name} (${symbol})`, href: `/etfs/${exchange}/${symbol}`, current: false },
    { name: 'Holdings', href: `/etfs/${exchange}/${symbol}/holdings`, current: true },
  ];

  const totalHoldings = holdings?.holdings?.length ?? 0;

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} />

      <header className="mb-4 mt-2">
        <h1 className="text-pretty text-2xl font-semibold tracking-tight sm:text-3xl">
          {etfData.name} ({symbol}) &mdash; Holdings
        </h1>
        <p className="text-sm text-gray-400 mt-1">Full list of reported holdings for this ETF.</p>
      </header>

      {totalHoldings > 0 ? (
        <EtfHoldings data={holdings} title="All Holdings" />
      ) : (
        <div className="bg-gray-900 rounded-lg shadow-sm px-3 py-6 sm:p-6 mt-6">
          <p className="text-sm text-gray-400">No holdings data available for this ETF.</p>
        </div>
      )}
    </PageWrapper>
  );
}
