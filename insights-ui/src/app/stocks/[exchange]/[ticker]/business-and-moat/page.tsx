import BusinessAndMoat from '@/components/ticker-reportsv1/BusinessAndMoat';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { generateBusinessAndMoatArticleSchema, generateBusinessAndMoatBreadcrumbSchema } from '@/utils/metadata-generators';
import { getCountryByExchange, USExchanges, CanadaExchanges, IndiaExchanges, UKExchanges } from '@/utils/countryExchangeUtils';
import {
  buildPerformanceBreadcrumbs,
  extractPerformanceTimestamps,
  fetchPerformanceByExchange,
  getPerformanceOrRedirect,
  truncateForMeta,
} from '@/utils/performance-page-utils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const DATA_SLUG = 'business-and-moat-data';
const PAGE_SLUG = 'business-and-moat';

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
    `Detailed business model and competitive moat analysis of ${companyName} (${ticker})${
      industryName ? ` in the ${industryName} industry` : ''
    }. Evaluate pricing power, market positioning, durability of advantages, and key competitive factors.`
  );
  const canonicalUrl = `https://koalagains.com/stocks/${exchange}/${ticker}/business-and-moat`;
  const keywords: string[] = [
    `${companyName} business model`,
    `${companyName} competitive moat`,
    `${ticker} business & moat`,
    `${companyName} pricing power`,
    `${companyName} competitive advantage`,
    'business moat analysis',
    'competitive moat',
    'investment insights',
    'KoalaGains',
  ];

  return {
    title: `${companyName} (${ticker}) Business & Moat Analysis (${year})`,
    description: shortDesc,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${companyName} (${ticker}) Business & Moat Analysis | KoalaGains`,
      description: shortDesc,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
      publishedTime: createdTime,
      modifiedTime: updatedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} (${ticker}) Business & Moat Analysis | KoalaGains`,
      description: shortDesc,
      site: '@koalagains',
      creator: '@koalagains',
    },
    keywords,
  };
}

/** PAGE */
export default async function BusinessAndMoatPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const routeParams = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  const bmData = await getPerformanceOrRedirect(exchange, ticker, DATA_SLUG, PAGE_SLUG);
  const tickerData = bmData.ticker;
  if (!tickerData) {
    notFound();
  }

  const country = getCountryByExchange(tickerData.exchange as USExchanges | CanadaExchanges | IndiaExchanges | UKExchanges);

  const articleSchema = generateBusinessAndMoatArticleSchema(tickerData, bmData.categoryResult);
  const breadcrumbSchema = generateBusinessAndMoatBreadcrumbSchema(tickerData, country);

  const breadcrumbs: BreadcrumbsOjbect[] = buildPerformanceBreadcrumbs(exchange, ticker, tickerData, 'Business & Moat', PAGE_SLUG);

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

      <BusinessAndMoat tickerData={tickerData} data={bmData} />
    </PageWrapper>
  );
}
