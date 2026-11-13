import StockSubPageActions from '@/app/stocks/[exchange]/[ticker]/StockSubPageActions';
import BusinessAndMoat from '@/components/ticker-reportsv1/BusinessAndMoat';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { generateBusinessAndMoatArticleSchema, generateBusinessAndMoatBreadcrumbSchema } from '@/utils/metadata-generators';
import { getCountryByExchange, USExchanges, CanadaExchanges, IndiaExchanges, UKExchanges } from '@/utils/countryExchangeUtils';
import {
  buildPerformanceBreadcrumbs,
  extractPerformanceTimestamps,
  fetchPerformanceByExchange,
  getPerformanceOrRedirect,
  fitMetaDescription,
} from '@/utils/performance-page-utils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import SimilarTickersSection from '@/components/ticker-reportsv1/SimilarTickersSection';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const DATA_SLUG = 'business-and-moat-data';
const PAGE_SLUG = 'business-and-moat';
const CATEGORY = TickerAnalysisCategory.BusinessAndMoat;

/**
 * Static-by-default with on-demand invalidation.
 */
export const dynamic = 'force-dynamic';

/** Route params (strict) */
export type RouteParams = Promise<Readonly<{ exchange: string; ticker: string }>>;

/** Metadata */
export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const routeParams = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  let companyName: string = ticker;
  let createdTime: string;
  let updatedTime: string;

  try {
    const data = await fetchPerformanceByExchange(exchange, ticker, DATA_SLUG, CATEGORY);
    companyName = data.ticker?.name ?? companyName;
    const timestamps = extractPerformanceTimestamps(data);
    createdTime = timestamps.createdTime;
    updatedTime = timestamps.updatedTime;
  } catch {
    const now = new Date().toISOString();
    createdTime = now;
    updatedTime = now;
  }

  const year = new Date().getFullYear();
  const firstSentence = `Business and moat analysis of ${companyName} (${ticker}).`;
  const shortDesc = fitMetaDescription(`${firstSentence} Covers its business model, pricing power and how durable its moat is.`, firstSentence);
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
      images: ['https://koalagains.com/koalagain_logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} (${ticker}) Business & Moat Analysis | KoalaGains`,
      description: shortDesc,
      site: '@koalagains',
      creator: '@koalagains',
      images: ['https://koalagains.com/koalagain_logo.png'],
    },
    keywords,
  };
}

/** PAGE */
export default async function BusinessAndMoatPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const routeParams = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  const bmData = await getPerformanceOrRedirect(exchange, ticker, DATA_SLUG, PAGE_SLUG, CATEGORY);
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

      <Breadcrumbs
        breadcrumbs={breadcrumbs}
        hideHomeIcon={true}
        mobileBackOnly={true}
        rightButton={<StockSubPageActions tickerId={tickerData.id} tickerSymbol={tickerData.symbol} tickerName={tickerData.name} />}
      />

      <BusinessAndMoat tickerData={tickerData} data={bmData} />

      <SimilarTickersSection exchange={tickerData.exchange} ticker={tickerData.symbol} subPageSlug="business-and-moat" />
    </PageWrapper>
  );
}
