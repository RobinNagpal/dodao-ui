'use client';

import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { FolderIcon, UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { useParams } from 'next/navigation';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Portfolio } from '@prisma/client';
import { PortfolioManagerProfile, User } from '@prisma/client';

interface PortfolioWithTickers extends Portfolio {
  portfolioTickers: Array<{
    id: string;
    tickerId: string;
    allocation: number;
  }>;
}

interface PortfolioManagerProfileResponse {
  portfolioManagerProfile: PortfolioManagerProfile & {
    user: User;
  };
}

export default function PortfolioManagerPortfoliosPage() {
  const params = useParams();
  const portfolioManagerId = params.id as string;

  // Fetch portfolio manager profile
  const {
    data: profileData,
    loading: profileLoading,
  } = useFetchData<PortfolioManagerProfileResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/portfolio-manager-profiles/${portfolioManagerId}`,
    { skipInitialFetch: !portfolioManagerId },
    'Failed to fetch portfolio manager profile'
  );

  // Fetch portfolios
  const {
    data: portfoliosData,
    loading: portfoliosLoading,
  } = useFetchData<{ portfolios: PortfolioWithTickers[] }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/portfolio-managers/${portfolioManagerId}/portfolios`,
    { skipInitialFetch: !portfolioManagerId },
    'Failed to fetch portfolios'
  );

  const profile = profileData?.portfolioManagerProfile;
  const portfolios = portfoliosData?.portfolios || [];

  if (profileLoading || portfoliosLoading) {
    return <FullPageLoader message="Loading portfolios..." />;
  }

  if (!profile) {
    return (
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-8">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
            <p className="text-gray-400">The portfolio manager profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const totalHoldings = portfolios.reduce((sum, p) => sum + p.portfolioTickers.length, 0);

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="py-6">
          {/* Profile Header */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {profile.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt={`${profile.user.name}'s profile`} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                    <UserIcon className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">{profile.user.name}</h1>
                    <p className="text-xl text-blue-400 mb-2">{profile.headline}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                  {profile.country && (
                    <div className="flex items-center gap-1">
                      <span>📍 {profile.country}</span>
                    </div>
                  )}
                  {profile.managerType && (
                    <div className="flex items-center gap-1">
                      <span>💼 {profile.managerType}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-300">{profile.summary}</p>
              </div>
            </div>
          </div>

          {/* Portfolios Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FolderIcon className="w-6 h-6 text-blue-500" />
                Portfolios
              </h2>
              <p className="text-gray-400 mt-1">
                {portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''} • {totalHoldings} total holdings
              </p>
            </div>
          </div>

          {/* Portfolios Grid */}
          {portfolios.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <FolderIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No portfolios yet</h3>
              <p className="text-gray-400">This portfolio manager hasn't published any portfolios yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio) => {
                const topHoldings = portfolio.portfolioTickers.slice(0, 3);
                const totalAllocation = portfolio.portfolioTickers.reduce((sum, t) => sum + t.allocation, 0);

                return (
                  <Link
                    key={portfolio.id}
                    href={`/portfolio-managers/${portfolioManagerId}/portfolios/${portfolio.id}`}
                    className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors block"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-white mb-2">{portfolio.name}</h3>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{portfolio.summary}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Holdings:</span>
                        <span className="text-white font-medium">{portfolio.portfolioTickers.length}</span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Total Allocation:</span>
                        <span className={`font-medium ${totalAllocation > 100 ? 'text-red-400' : totalAllocation < 100 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {totalAllocation.toFixed(1)}%
                        </span>
                      </div>

                      {topHoldings.length > 0 && (
                        <div className="pt-3 border-t border-gray-700">
                          <div className="text-sm text-gray-400 mb-2">Top Holdings:</div>
                          <div className="space-y-1">
                            {topHoldings.map((ticker) => (
                              <div key={ticker.id} className="flex justify-between items-center text-sm">
                                <span className="text-gray-300">{ticker.tickerId}</span>
                                <span className="text-gray-400">{ticker.allocation}%</span>
                              </div>
                            ))}
                            {portfolio.portfolioTickers.length > 3 && (
                              <div className="text-sm text-gray-500">+{portfolio.portfolioTickers.length - 3} more</div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-700">
                        <span className="text-blue-400 hover:text-blue-300 text-sm font-medium">View Details →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

