import PortfolioStats from '@/components/portfolios/PortfolioStats';
import PortfolioDetails from '@/components/portfolios/PortfolioDetails';
import PortfolioDetailActions from '../../../../../components/portfolios/PortfolioDetailActions';
import PortfolioHoldingsActions from '../../../../../components/portfolios/PortfolioHoldingsActions';
import { Portfolio, PortfolioTicker } from '@/types/portfolio';
import { UserTickerList, PortfolioManagerProfile, User } from '@prisma/client';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ArrowLeftIcon, FolderIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { getPortfolioProfileTag } from '@/utils/ticker-v1-cache-utils';

interface PortfolioWithProfile extends Portfolio {
  portfolioManagerProfile: PortfolioManagerProfile & {
    user: User;
  };
}

interface PageProps {
  params: Promise<{ id: string; portfolioId: string }>;
  searchParams: Promise<{ updatedAt?: string }>;
}

const WEEK = 60 * 60 * 24 * 7;

export default async function PortfolioDetailPage({ params: paramsPromise, searchParams: searchParamsPromise }: PageProps) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const portfolioManagerId = params.id;
  const portfolioId = params.portfolioId;

  // Fetch portfolio details on server
  const res = await fetch(`${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/portfolio-managers/${portfolioManagerId}/portfolios/${portfolioId}`, {
    next: { revalidate: WEEK, tags: [getPortfolioProfileTag(portfolioManagerId)] },
  });

  const data = await res.json();
  const portfolio = data.portfolio as PortfolioWithProfile | null;

  if (!portfolio) {
    return (
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-8">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Portfolio not found</h2>
            <p className="text-gray-400">The portfolio you’re looking for doesn’t exist.</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const portfolioTickers = portfolio.portfolioTickers || [];

  // Group portfolio tickers by list
  const listsMap = new Map<string, { list: UserTickerList; tickers: PortfolioTicker[] }>();
  const unlisted: PortfolioTicker[] = [];

  portfolioTickers.forEach((ticker) => {
    if (ticker.lists && ticker.lists.length > 0) {
      ticker.lists.forEach((list: UserTickerList) => {
        if (!listsMap.has(list.id)) {
          listsMap.set(list.id, { list, tickers: [] });
        }
        listsMap.get(list.id)!.tickers.push(ticker);
      });
    } else {
      unlisted.push(ticker);
    }
  });

  // Sort tickers within each list by allocation descending
  listsMap.forEach((listData) => {
    listData.tickers.sort((a, b) => b.allocation - a.allocation);
  });

  // Sort unlisted tickers by allocation descending
  unlisted.sort((a, b) => b.allocation - a.allocation);

  const listsWithTickers = Array.from(listsMap.values()).sort((a, b) => a.list.name.localeCompare(b.list.name));
  const unlistedTickers = unlisted;

  const totalAllocation = portfolioTickers.reduce((sum, ticker) => sum + ticker.allocation, 0);

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href={`/portfolio-managers/${portfolioManagerId}/portfolios`} className="text-blue-400 hover:text-blue-300">
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  <FolderIcon className="w-8 h-8 text-blue-500" />
                  {portfolio.name}
                </h1>
                <p className="text-gray-400 mt-1">
                  {portfolioTickers.length} holdings • Total Allocation: {totalAllocation.toFixed(1)}%
                </p>
              </div>
            </div>

            <PortfolioDetailActions portfolio={portfolio} portfolioManagerId={portfolioManagerId} portfolioId={portfolioId} />
          </div>

          {/* Portfolio Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <PortfolioDetails portfolio={portfolio} />
            </div>

            <PortfolioStats portfolioTickers={portfolioTickers} />
          </div>

          {/* Portfolio Holdings */}
          <PortfolioHoldingsActions
            portfolioTickers={portfolioTickers}
            listsWithTickers={listsWithTickers}
            unlistedTickers={unlistedTickers}
            portfolioManagerId={portfolioManagerId}
            portfolioId={portfolioId}
            portfolioManagerUserId={portfolio.portfolioManagerProfile.user.id}
          />
        </div>
      </div>
    </PageWrapper>
  );
}
