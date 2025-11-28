import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TopGainerWithTicker } from '@/types/top-gainers';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ country: string }>;
}

export default async function DailyTopGainersPage({ params }: PageProps) {
  const { country } = await params;

  // Fetch top gainers from the API with country filter
  const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/daily-top-gainers?country=${country}`, {
    cache: 'no-cache',
  });

  const topGainers: TopGainerWithTicker[] = await response.json();

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-color">Daily Top Gainers - {country.toUpperCase()}</h1>
          <p className="text-muted-foreground mt-2">Stocks with the highest percentage gains today</p>
        </div>

        {topGainers.length === 0 ? (
          <div className="text-center py-12 background-color rounded-lg shadow-sm border border-color">
            <p className="text-muted-foreground text-lg">No top gainers found</p>
          </div>
        ) : (
          <div className="background-color rounded-lg shadow-sm border border-color overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y border-color">
                <thead className="block-bg-color">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Exchange</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Company Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Change %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-color">
                  {topGainers.map((gainer) => (
                    <tr key={gainer.id} className="hover:block-bg-color transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-color">{gainer.ticker.symbol}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                          {gainer.ticker.exchange}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-color">{gainer.ticker.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600 dark:text-green-400">+{gainer.percentageChange.toFixed(2)}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-color">{gainer.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">{new Date(gainer.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/daily-top-gainers/details/${gainer.id}`}
                          className="inline-flex items-center px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow hover:bg-primary/90 transition-colors"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
