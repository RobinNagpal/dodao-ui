import AdminTimestamp from '@/components/auth/AdminTimestamp';
import TickerRelatedSections from '@/components/ticker-reportsv1/TickerRelatedSections';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { MANAGEMENT_TEAM_ALIGNMENT_VERDICT_LABELS, ManagementTeamAlignmentVerdict } from '@/types/ticker-typesv1';
import { getCountryByExchange, USExchanges, CanadaExchanges, IndiaExchanges, UKExchanges, SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { tickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import { generateManagementTeamArticleSchema, generateManagementTeamBreadcrumbSchema } from '@/utils/metadata-generators';
import { TickerV1FastResponse } from '@/utils/ticker-v1-model-utils';
import { parseMarkdown } from '@/util/parse-markdown';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound, permanentRedirect } from 'next/navigation';

/**
 * Static-by-default with on-demand invalidation.
 */
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;

export type RouteParams = Promise<Readonly<{ exchange: string; ticker: string }>>;

const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

function truncateForMeta(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

async function fetchTickerByExchange(exchange: string, ticker: string): Promise<TickerV1FastResponse | null> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/exchange/${exchange.toUpperCase()}/${ticker.toUpperCase()}?allowNull=true`;
  const res: Response = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [tickerAndExchangeTag(ticker, exchange)] } });
  if (!res.ok) {
    throw new Error(`fetchTickerByExchange failed (${res.status}): ${url}`);
  }
  return (await res.json()) as TickerV1FastResponse | null;
}

async function fetchTickerAnyExchange(ticker: string): Promise<TickerV1FastResponse | null> {
  const url: string = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker.toUpperCase()}?allowNull=true`;
  const res: Response = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`fetchTickerAnyExchange failed (${res.status}): ${url}`);
  }
  return (await res.json()) as TickerV1FastResponse | null;
}

async function getTickerOrRedirect(exchange: string, ticker: string): Promise<TickerV1FastResponse> {
  const data = await fetchTickerByExchange(exchange, ticker);
  if (data) return data;

  noStore();
  const fallback = await fetchTickerAnyExchange(ticker);
  if (!fallback) notFound();

  const canonicalExchange: string = fallback.exchange.toUpperCase();
  if (canonicalExchange !== exchange.toUpperCase()) {
    permanentRedirect(`/stocks/${canonicalExchange}/${fallback.symbol.toUpperCase()}/management-team`);
  }
  return fallback;
}

function getVerdictBadgeClasses(verdict: ManagementTeamAlignmentVerdict): string {
  switch (verdict) {
    case ManagementTeamAlignmentVerdict.OWNER_OPERATOR:
    case ManagementTeamAlignmentVerdict.STRONGLY_ALIGNED:
      return 'bg-green-900 text-green-200';
    case ManagementTeamAlignmentVerdict.ALIGNED:
      return 'bg-blue-900 text-blue-200';
    case ManagementTeamAlignmentVerdict.WEAKLY_ALIGNED:
      return 'bg-yellow-900 text-yellow-200';
    case ManagementTeamAlignmentVerdict.MISALIGNED:
      return 'bg-red-900 text-red-200';
    default:
      return 'bg-gray-800 text-gray-200';
  }
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const routeParams = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  let companyName: string = ticker;
  let industryName: string = '';
  let createdTime: string;
  let updatedTime: string;

  try {
    const data = await fetchTickerByExchange(exchange, ticker);
    companyName = data?.name ?? companyName;
    industryName = data?.industry?.name || data?.industryKey || '';
    const report = data?.managementTeamReports?.[0];
    const createdAt = report?.createdAt || data?.createdAt || new Date();
    const updatedAt = report?.updatedAt || data?.updatedAt || new Date();
    createdTime = new Date(createdAt).toISOString();
    updatedTime = new Date(updatedAt).toISOString();
  } catch {
    const now = new Date().toISOString();
    createdTime = now;
    updatedTime = now;
  }

  const year = new Date().getFullYear();
  const shortDesc = truncateForMeta(
    `Management team experience and alignment analysis for ${companyName} (${ticker})${
      industryName ? ` in the ${industryName} industry` : ''
    }. Leadership tenure, insider ownership, compensation alignment, and insider trading activity.`
  );
  const canonicalUrl = `https://koalagains.com/stocks/${exchange}/${ticker}/management-team`;
  const keywords: string[] = [
    `${companyName} management team`,
    `${companyName} leadership`,
    `${ticker} management`,
    `${companyName} insider ownership`,
    `${companyName} executive compensation`,
    `${ticker} insider trading`,
    'management alignment',
    'executive tenure',
    'investment insights',
    'KoalaGains',
  ];

  return {
    title: `${companyName} (${ticker}) Management Team Experience & Alignment (${year})`,
    description: shortDesc,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${companyName} (${ticker}) Management Team Experience & Alignment | KoalaGains`,
      description: shortDesc,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
      publishedTime: createdTime,
      modifiedTime: updatedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} (${ticker}) Management Team Experience & Alignment | KoalaGains`,
      description: shortDesc,
      site: '@koalagains',
      creator: '@koalagains',
    },
    keywords,
  };
}

export default async function ManagementTeamPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const routeParams = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  const tickerData = await getTickerOrRedirect(exchange, ticker);
  const report = tickerData.managementTeamReports?.[0];
  if (!report) {
    notFound();
  }

  const country: SupportedCountries = getCountryByExchange(tickerData.exchange as USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges);
  const industryName: string = tickerData.industry?.name || tickerData.industryKey;

  const articleSchema = generateManagementTeamArticleSchema(tickerData, report);
  const breadcrumbSchema = generateManagementTeamBreadcrumbSchema(tickerData, country);

  const breadcrumbs: BreadcrumbsOjbect[] =
    country === 'US'
      ? [
          { name: 'US Stocks', href: '/stocks', current: false },
          { name: industryName, href: `/stocks/industries/${tickerData.industryKey}`, current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
          { name: 'Management Team', href: `/stocks/${exchange}/${ticker}/management-team`, current: true },
        ]
      : country
      ? [
          { name: `${country} Stocks`, href: `/stocks/countries/${country}`, current: false },
          { name: industryName, href: `/stocks/countries/${country}/industries/${tickerData.industryKey}`, current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
          { name: 'Management Team', href: `/stocks/${exchange}/${ticker}/management-team`, current: true },
        ]
      : [
          { name: 'Stocks', href: '/stocks', current: false },
          { name: ticker, href: `/stocks/${exchange}/${ticker}`, current: false },
          { name: 'Management Team', href: `/stocks/${exchange}/${ticker}/management-team`, current: true },
        ];

  const verdict = report.alignmentVerdict as ManagementTeamAlignmentVerdict;
  const verdictLabel = MANAGEMENT_TEAM_ALIGNMENT_VERDICT_LABELS[verdict] || report.alignmentVerdict;

  return (
    <PageWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleSchema, breadcrumbSchema]),
        }}
      />

      <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} />

      <article itemScope itemType="https://schema.org/Article">
        <section className="mb-6">
          <h1 className="text-pretty text-2xl font-semibold tracking-tight sm:text-4xl" itemProp="headline">
            {tickerData.name} ({tickerData.symbol}) — Management Team Experience &amp; Alignment
          </h1>
        </section>

        <section className="bg-gray-900 rounded-lg shadow-sm px-2 py-4 sm:p-6 mb-8" itemProp="articleBody">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-700">
            <h2 className="text-xl font-bold">Alignment Verdict</h2>
            <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium ${getVerdictBadgeClasses(verdict)}`}>
              {verdictLabel}
            </span>
            {report.updatedAt && <AdminTimestamp date={report.updatedAt} />}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <div className="markdown markdown-body text-gray-300" dangerouslySetInnerHTML={{ __html: parseMarkdown(report.summary) }} />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Detailed Analysis</h3>
            <div className="markdown markdown-body text-gray-300" dangerouslySetInnerHTML={{ __html: parseMarkdown(report.detailedAnalysis) }} />
          </div>
        </section>

        {/* @ts-expect-error Async Server Component (React 18 typing limitation) */}
        <TickerRelatedSections
          tickerId={tickerData.id}
          exchange={tickerData.exchange}
          symbol={tickerData.symbol}
          companyName={tickerData.name}
          currentSlug="management-team"
        />
      </article>
    </PageWrapper>
  );
}
