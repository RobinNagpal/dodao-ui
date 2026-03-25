import PastPerformance from '@/components/ticker-reportsv1/PastPerformance';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { generatePastPerformanceArticleSchema, generatePastPerformanceBreadcrumbSchema } from '@/utils/metadata-generators';
import {
  buildPerformanceBreadcrumbs,
  extractPerformanceTimestamps,
  fetchPerformanceByExchange,
  getPerformanceOrRedirect,
  truncateForMeta,
} from '@/utils/performance-page-utils';
import { getCountryByExchange, USExchanges, CanadaExchanges, IndiaExchanges, UKExchanges } from '@/utils/countryExchangeUtils';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const DATA_SLUG = 'past-performance-data';
const PAGE_SLUG = 'past-performance';

/**
 * Static-by-default with on-demand invalidation.
 */
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;

/** Route params (strict) */
export type RouteParams = Promise<Readonly<{ exchange: string; ticker: string }>>;

/** Metadata */
export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const routeParams = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  let companyName: string = ticker;
  let industryName: string = '';
  let createdTime: string;
  let updatedTime: string;

  try {
    const data = await fetchPerformanceByExchange(exchange, ticker, DATA_SLUG);
    companyName = data.ticker?.name ?? companyName;
    industryName = data.ticker?.industry?.name || data.ticker?.industryKey || '';
    const timestamps = extractPerformanceTimestamps(data);
    createdTime = timestamps.createdTime;
    updatedTime = timestamps.updatedTime;
  } catch {
    const now = new Date().toISOString();
    createdTime = now;
    updatedTime = now;
  }

  const year = new Date().getFullYear();

  const shortDesc = truncateForMeta(
    `Detailed historical performance analysis of ${companyName} (${ticker})${
      industryName ? ` in the ${industryName} industry` : ''
    }. Evaluate earnings growth, revenue trends, return on equity, and other key historical metrics.`
  );

  const canonicalUrl = `https://koalagains.com/stocks/${exchange}/${ticker}/${PAGE_SLUG}`;

  const keywords: string[] = [
    `${companyName} past performance`,
    `${companyName} historical analysis`,
    `${ticker} earnings growth`,
    `${companyName} revenue trends`,
    `${companyName} return on equity`,
    `${ticker} financial history`,
    `${companyName} stock history`,
    'past performance analysis',
    'historical stock analysis',
    'investment insights',
    'KoalaGains',
  ];

  return {
    title: `${companyName} (${ticker}) Past Performance Analysis (${year})`,
    description: shortDesc,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${companyName} (${ticker}) Past Performance Analysis | KoalaGains`,
      description: shortDesc,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
      publishedTime: createdTime,
      modifiedTime: updatedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} (${ticker}) Past Performance Analysis | KoalaGains`,
      description: shortDesc,
      site: '@koalagains',
      creator: '@koalagains',
    },
    keywords,
  };
}

/** PAGE */
export default async function PastPerformancePage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const routeParams = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  const pastPerformanceData = await getPerformanceOrRedirect(exchange, ticker, DATA_SLUG, PAGE_SLUG);
  const tickerData = pastPerformanceData.ticker;
  if (!tickerData) {
    notFound();
  }

  const country = getCountryByExchange(tickerData.exchange as USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges);

  const articleSchema = generatePastPerformanceArticleSchema(tickerData, pastPerformanceData.categoryResult);
  const breadcrumbSchema = generatePastPerformanceBreadcrumbSchema(tickerData, country);

  const breadcrumbs = buildPerformanceBreadcrumbs(exchange, ticker, tickerData, 'Past Performance', PAGE_SLUG);

  return (
    <PageWrapper>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleSchema, breadcrumbSchema]),
        }}
      />

      <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} />

      <PastPerformance tickerData={tickerData} data={pastPerformanceData} />
    </PageWrapper>
  );
}
