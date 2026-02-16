import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TopLoserWithRelated } from '@/types/daily-stock-movers';
import { DailyMoverType } from '@/types/daily-mover-constants';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import StockMoverDetails from '@/components/daily-stock-movers/StockMoverDetails';
import RelatedDailyMovers from '@/components/daily-stock-movers/RelatedDailyMovers';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Metadata } from 'next';
import { generateStockMoverMetadata, generateStockMoverArticleSchema, generateStockMoverBreadcrumbSchema } from '@/utils/metadata-generators';
import { getDailyMoverDetailsTag } from '@/utils/ticker-v1-cache-utils';
import { getCountryByExchange, toExchange } from '@/utils/countryExchangeUtils';

interface PageProps {
  params: Promise<{ topLosersId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topLosersId } = await params;

  try {
    const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/daily-top-losers/${topLosersId}`, {
      next: {
        revalidate: 604800,
        tags: [getDailyMoverDetailsTag(topLosersId)],
      },
    });

    if (!response.ok) {
      return {
        title: 'Top Loser Details',
        description: 'Daily top loser stock analysis and insights',
      };
    }

    const data: TopLoserWithRelated = await response.json();
    return generateStockMoverMetadata(data.mover, DailyMoverType.LOSER, topLosersId);
  } catch (error) {
    console.error('Error generating metadata for top loser:', error);
    return {
      title: 'Top Loser Details',
      description: 'Daily top loser stock analysis and insights',
    };
  }
}

export default async function TopLoserDetailsPage({ params }: PageProps) {
  const { topLosersId } = await params;

  // Fetch top loser details from the API with cache tag
  const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/daily-top-losers/${topLosersId}`, {
    next: {
      revalidate: 604800, // 7 days in seconds
      tags: [getDailyMoverDetailsTag(topLosersId)],
    },
  });

  if (!response.ok) {
    return (
      <PageWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 background-color rounded-lg shadow-sm border border-color">
            <p className="text-muted-foreground text-lg">Top loser not found</p>
            <Link href="/daily-top-movers/top-losers" className="mt-4 inline-block text-primary hover:underline">
              Back to Top Losers
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const { mover: topLoser, relatedMovers } = await response.json();

  // Generate structured data
  const articleSchema = generateStockMoverArticleSchema(topLoser, DailyMoverType.LOSER, topLosersId);
  const breadcrumbSchema = generateStockMoverBreadcrumbSchema(topLoser, DailyMoverType.LOSER, topLosersId);

  // Get country from ticker exchange
  const country = getCountryByExchange(toExchange(topLoser.ticker.exchange));

  const breadcrumbs = [
    { name: 'Daily Top Losers', href: `/daily-top-movers/top-losers/country/${country}`, current: false },
    { name: topLoser.ticker.name, href: `/daily-top-movers/top-losers/details/${topLosersId}`, current: true },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleSchema, breadcrumbSchema]),
        }}
      />

      <StockMoverDetails mover={topLoser} type={DailyMoverType.LOSER} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RelatedDailyMovers movers={relatedMovers} type={DailyMoverType.LOSER} />
      </div>
    </PageWrapper>
  );
}
