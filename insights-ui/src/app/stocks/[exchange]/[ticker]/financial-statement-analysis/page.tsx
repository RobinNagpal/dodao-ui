import FinancialStatementAnalysis from '@/components/ticker-reportsv1/FinancialStatementAnalysis';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { generateFinancialStatementAnalysisArticleSchema, generateFinancialStatementAnalysisBreadcrumbSchema } from '@/utils/metadata-generators';
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

const DATA_SLUG = 'financial-statement-analysis-data';
const PAGE_SLUG = 'financial-statement-analysis';

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
    `Detailed financial statement analysis of ${companyName} (${ticker})${
      industryName ? ` in the ${industryName} industry` : ''
    }. Review income statement, balance sheet, cash flow, and key financial ratios to gauge overall financial health.`
  );

  const canonicalUrl = `https://koalagains.com/stocks/${exchange}/${ticker}/${PAGE_SLUG}`;

  const keywords: string[] = [
    `${companyName} financial statements`,
    `${companyName} balance sheet`,
    `${ticker} income statement`,
    `${companyName} cash flow`,
    `${ticker} financial ratios`,
    `${companyName} financial health`,
    `${ticker} financial analysis`,
    'financial statement analysis',
    'balance sheet analysis',
    'cash flow analysis',
    'investment insights',
    'KoalaGains',
  ];

  return {
    title: `${companyName} (${ticker}) Financial Statement Analysis (${year})`,
    description: shortDesc,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${companyName} (${ticker}) Financial Statement Analysis | KoalaGains`,
      description: shortDesc,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
      publishedTime: createdTime,
      modifiedTime: updatedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} (${ticker}) Financial Statement Analysis | KoalaGains`,
      description: shortDesc,
      site: '@koalagains',
      creator: '@koalagains',
    },
    keywords,
  };
}

/** PAGE */
export default async function FinancialStatementAnalysisPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const routeParams = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  const financialStatementData = await getPerformanceOrRedirect(exchange, ticker, DATA_SLUG, PAGE_SLUG);
  const tickerData = financialStatementData.ticker;
  if (!tickerData) {
    notFound();
  }

  const country = getCountryByExchange(tickerData.exchange as USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges);

  const articleSchema = generateFinancialStatementAnalysisArticleSchema(tickerData, financialStatementData.categoryResult);
  const breadcrumbSchema = generateFinancialStatementAnalysisBreadcrumbSchema(tickerData, country);

  const breadcrumbs = buildPerformanceBreadcrumbs(exchange, ticker, tickerData, 'Financial Statement Analysis', PAGE_SLUG);

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

      <FinancialStatementAnalysis tickerData={tickerData} data={financialStatementData} />
    </PageWrapper>
  );
}
