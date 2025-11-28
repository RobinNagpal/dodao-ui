import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TopGainerWithTicker } from '@/types/top-gainers';
import { getCountryByExchange, toExchange } from '@/utils/countryExchangeUtils';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ topGainersId: string }>;
}

export default async function TopGainerDetailsPage({ params }: PageProps) {
  const { topGainersId } = await params;

  // Fetch top gainer details from the API
  const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/daily-top-gainers/${topGainersId}`, {
    cache: 'no-cache',
  });

  if (!response.ok) {
    return (
      <PageWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 background-color rounded-lg shadow-sm border border-color">
            <p className="text-muted-foreground text-lg">Top gainer not found</p>
            <Link href="/daily-top-gainers" className="mt-4 inline-block text-primary hover:underline">
              Back to Top Gainers
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const topGainer: TopGainerWithTicker = await response.json();
  const country = getCountryByExchange(toExchange(topGainer.ticker.exchange));

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href={`/daily-top-gainers/country/${country}`} className="text-primary hover:underline text-sm">
            ← Back to Top Gainers
          </Link>
        </div>

        <div className="background-color rounded-lg shadow-sm border border-color p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-color mb-2">{topGainer.ticker.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="text-lg font-semibold text-color">{topGainer.ticker.symbol}</span>
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                {topGainer.ticker.exchange}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="background-color rounded-lg border border-color p-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-2">Percentage Change</h2>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">+{topGainer.percentageChange.toFixed(2)}%</p>
            </div>

            <div className="background-color rounded-lg border border-color p-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-2">Date</h2>
              <p className="text-2xl font-semibold text-color">{new Date(topGainer.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {topGainer.title && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-color mb-3">Title</h2>
              <p className="text-color">{topGainer.title}</p>
            </div>
          )}

          {topGainer.oneLineExplanation && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-color mb-3">Summary</h2>
              <p className="text-color">{topGainer.oneLineExplanation}</p>
            </div>
          )}

          {topGainer.detailedExplanation && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-color mb-3">Detailed Explanation</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-color whitespace-pre-wrap">{topGainer.detailedExplanation}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
