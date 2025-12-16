import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TopGainerWithTicker } from '@/types/daily-stock-movers';
import { DailyMoverType } from '@/utils/daily-movers-generation-utils';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import StockMoverDetails from '@/components/daily-stock-movers/StockMoverDetails';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Metadata } from 'next';
import { generateStockMoverMetadata, generateStockMoverArticleSchema, generateStockMoverBreadcrumbSchema } from '@/utils/metadata-generators';
import { getDailyMoverDetailsTag } from '@/utils/ticker-v1-cache-utils';
import { getCountryByExchange, toExchange } from '@/utils/countryExchangeUtils';

interface PageProps {
  params: Promise<{ topGainersId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topGainersId } = await params;

  try {
    const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/daily-top-gainers/${topGainersId}`, {
      next: {
        revalidate: 604800,
        tags: [getDailyMoverDetailsTag(topGainersId)],
      },
    });

    if (!response.ok) {
      return {
        title: 'Top Gainer Details',
        description: 'Daily top gainer stock analysis and insights',
      };
    }

    const topGainer: TopGainerWithTicker = await response.json();
    return generateStockMoverMetadata(topGainer, DailyMoverType.GAINER, topGainersId);
  } catch (error) {
    console.error('Error generating metadata for top gainer:', error);
    return {
      title: 'Top Gainer Details',
      description: 'Daily top gainer stock analysis and insights',
    };
  }
}

export default async function TopGainerDetailsPage({ params }: PageProps) {
  const { topGainersId } = await params;

  // Fetch top gainer details from the API with cache tag
  const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/daily-top-gainers/${topGainersId}`, {
    next: {
      revalidate: 604800, // 7 days in seconds
      tags: [getDailyMoverDetailsTag(topGainersId)],
    },
  });

  if (!response.ok) {
    return (
      <PageWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 background-color rounded-lg shadow-sm border border-color">
            <p className="text-muted-foreground text-lg">Top gainer not found</p>
            <Link href="/daily-top-movers/top-gainers" className="mt-4 inline-block text-primary hover:underline">
              Back to Top Gainers
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const topGainer: TopGainerWithTicker = await response.json();

  // Generate structured data
  const articleSchema = generateStockMoverArticleSchema(topGainer, DailyMoverType.GAINER, topGainersId);
  const breadcrumbSchema = generateStockMoverBreadcrumbSchema(topGainer, DailyMoverType.GAINER, topGainersId);

  // Get country from ticker exchange
  const country = getCountryByExchange(toExchange(topGainer.ticker.exchange));

  const breadcrumbs = [
    { name: 'Daily Top Gainers', href: `/daily-top-movers/top-gainers/country/${country}`, current: false },
    { name: topGainer.ticker.name, href: `/daily-top-movers/top-gainers/details/${topGainersId}`, current: true },
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

      <StockMoverDetails mover={topGainer} type={DailyMoverType.GAINER} />
    </PageWrapper>
  );
}
