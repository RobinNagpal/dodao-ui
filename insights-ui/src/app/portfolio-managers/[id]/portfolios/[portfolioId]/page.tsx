'use client';

import AddEditPortfolioModal from '@/components/portfolios/AddEditPortfolioModal';
import AddEditPortfolioTickerModal from '@/components/portfolios/AddEditPortfolioTickerModal';
import PortfolioHoldings from '@/components/portfolios/PortfolioHoldings';
import DeleteConfirmationModal from '@/app/admin-v1/industry-management/DeleteConfirmationModal';
import { Portfolio, PortfolioTicker } from '@/types/portfolio';
import { UserTickerList, PortfolioManagerProfile, User } from '@prisma/client';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

interface PortfolioWithProfile extends Portfolio {
  portfolioManagerProfile: PortfolioManagerProfile & {
    user: User;
  };
}
import { PlusIcon, PencilIcon, ArrowLeftIcon, FolderIcon, UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import Button from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { KoalaGainsSession } from '@/types/auth';

export default function PortfolioDetailPage() {
  const { data: koalaSession } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;
  const router = useRouter();
  const params = useParams();
  const portfolioManagerId = params.id as string;
  const portfolioId = params.portfolioId as string;

  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [editingTicker, setEditingTicker] = useState<PortfolioTicker | null>(null);
  const [deletingTicker, setDeletingTicker] = useState<PortfolioTicker | null>(null);
  const [deletingPortfolio, setDeletingPortfolio] = useState<boolean>(false);
  const [showAddTickerModal, setShowAddTickerModal] = useState(false);
  const [openListIds, setOpenListIds] = useState<Set<string>>(new Set());

  // Fetch portfolio details
  const {
    data: portfolioData,
    loading: portfolioLoading,
    reFetchData: refetchPortfolio,
  } = useFetchData<{ portfolio: PortfolioWithProfile }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/portfolio-managers/${portfolioManagerId}/portfolios/${portfolioId}`,
    { skipInitialFetch: !portfolioManagerId || !portfolioId },
    'Failed to fetch portfolio'
  );

  const { deleteData: deleteTicker, loading: isDeletingTicker } = useDeleteData({
    successMessage: 'Ticker removed from portfolio successfully!',
    errorMessage: 'Failed to remove ticker from portfolio.',
  });

  const { deleteData: deletePortfolio, loading: isDeletingPortfolio } = useDeleteData({
    successMessage: 'Portfolio deleted successfully!',
    errorMessage: 'Failed to delete portfolio.',
  });

  const portfolio = portfolioData?.portfolio;
  const portfolioTickers = portfolio?.portfolioTickers || [];
  
  // Check if current user is the owner
  const isOwner = session?.userId && portfolio?.portfolioManagerProfile?.userId === session.userId;

  // Group portfolio tickers by list
  const { listsWithTickers, unlistedTickers } = useMemo(() => {
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

    return {
      listsWithTickers: Array.from(listsMap.values()).sort((a, b) => a.list.name.localeCompare(b.list.name)),
      unlistedTickers: unlisted,
    };
  }, [portfolioTickers]);

  const totalAllocation = portfolioTickers.reduce((sum, ticker) => sum + ticker.allocation, 0);

  if (portfolioLoading) {
    return <FullPageLoader message="Loading portfolio details..." />;
  }

  if (!portfolio) {
    return (
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-8">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Portfolio not found</h2>
            <p className="text-gray-400">The portfolio you're looking for doesn't exist.</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const handleDeleteTicker = async () => {
    if (!deletingTicker) return;

    const result = await deleteTicker(
      `${getBaseUrl()}/api/${KoalaGainsSpaceId}/portfolio-managers/${portfolioManagerId}/portfolios/${portfolioId}/tickers?id=${deletingTicker.id}`
    );
    if (result) {
      await refetchPortfolio();
      setDeletingTicker(null);
    }
  };

  const handleDeletePortfolio = async () => {
    const result = await deletePortfolio(
      `${getBaseUrl()}/api/${KoalaGainsSpaceId}/portfolio-managers/${portfolioManagerId}/portfolios/${portfolioId}`
    );
    if (result) {
      router.push(`/portfolio-managers/${portfolioManagerId}`);
    }
  };

  const handlePortfolioSuccess = async () => {
    await refetchPortfolio();
    setEditingPortfolio(null);
  };

  const handleTickerSuccess = async () => {
    await refetchPortfolio();
    setEditingTicker(null);
    setShowAddTickerModal(false);
  };

  const handleAccordionClick = (e: React.MouseEvent<HTMLElement>, listId: string) => {
    e.stopPropagation();
    setOpenListIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(listId)) {
        newSet.delete(listId);
      } else {
        newSet.add(listId);
      }
      return newSet;
    });
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="py-6">
          {/* Profile Header */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {portfolio.portfolioManagerProfile?.profileImageUrl ? (
                  <img
                    src={portfolio.portfolioManagerProfile.profileImageUrl}
                    alt={`${portfolio.portfolioManagerProfile.user.name}'s profile`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <Link href={`/portfolio-managers/${portfolioManagerId}`} className="text-blue-400 hover:text-blue-300 font-medium">
                  {portfolio.portfolioManagerProfile?.user.name}
                </Link>
                <p className="text-sm text-gray-400">{portfolio.portfolioManagerProfile?.headline}</p>
              </div>
            </div>
          </div>

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

            {isOwner && (
              <div className="flex gap-2">
                <Button onClick={() => setEditingPortfolio(portfolio)} variant="outlined" className="flex items-center gap-2">
                  <PencilIcon className="w-4 h-4" />
                  Edit Portfolio
                </Button>
                <Button onClick={() => setShowAddTickerModal(true)} variant="contained" primary className="flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" />
                  Add Holding
                </Button>
              </div>
            )}
          </div>

          {/* Portfolio Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Portfolio Summary</h2>
                <p className="text-gray-300 mb-4">{portfolio.summary}</p>

                <h3 className="text-lg font-medium text-white mb-3">Detailed Description</h3>
                <div className="text-gray-300 prose prose-invert max-w-none">
                  {portfolio.detailedDescription ? (
                    <div dangerouslySetInnerHTML={{ __html: portfolio.detailedDescription.replace(/\n/g, '<br>') }} />
                  ) : (
                    <p className="text-gray-500 italic">No detailed description provided.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Portfolio Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Holdings</span>
                  <span className="text-white font-medium">{portfolioTickers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Allocation</span>
                  <span className={`font-medium ${totalAllocation > 100 ? 'text-red-400' : totalAllocation < 100 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {totalAllocation.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Unallocated</span>
                  <span className={`font-medium ${100 - totalAllocation < 0 ? 'text-red-400' : 'text-gray-300'}`}>{(100 - totalAllocation).toFixed(1)}%</span>
                </div>
              </div>

              {isOwner && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <Button onClick={() => setDeletingPortfolio(true)} variant="text" className="text-red-400 hover:text-red-300 w-full">
                    Delete Portfolio
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Portfolio Holdings */}
          <PortfolioHoldings
            portfolioTickers={portfolioTickers}
            listsWithTickers={listsWithTickers}
            unlistedTickers={unlistedTickers}
            openListIds={openListIds}
            handleAccordionClick={handleAccordionClick}
            setEditingTicker={isOwner ? setEditingTicker : () => {}}
            setDeletingTicker={isOwner ? setDeletingTicker : () => {}}
            setShowAddTickerModal={isOwner ? setShowAddTickerModal : () => {}}
          />
        </div>

        {/* Edit Portfolio Modal */}
        {isOwner && editingPortfolio && (
          <AddEditPortfolioModal
            isOpen={!!editingPortfolio}
            onClose={() => setEditingPortfolio(null)}
            portfolio={editingPortfolio}
            onSuccess={handlePortfolioSuccess}
            portfolioManagerId={portfolioManagerId}
          />
        )}

        {/* Add/Edit Ticker Modal */}
        {isOwner && (
          <AddEditPortfolioTickerModal
            isOpen={showAddTickerModal || !!editingTicker}
            onClose={() => {
              setShowAddTickerModal(false);
              setEditingTicker(null);
            }}
            portfolioId={portfolioId}
            portfolioTicker={editingTicker}
            onSuccess={handleTickerSuccess}
            portfolioManagerId={portfolioManagerId}
          />
        )}

        {/* Delete Ticker Confirmation Modal */}
        {isOwner && deletingTicker && (
          <DeleteConfirmationModal
            open={!!deletingTicker}
            onClose={() => setDeletingTicker(null)}
            onDelete={handleDeleteTicker}
            deleting={isDeletingTicker}
            title={`Remove ${deletingTicker.ticker?.symbol || 'ticker'} from portfolio?`}
            deleteButtonText="Remove Holding"
            confirmationText="REMOVE"
          />
        )}

        {/* Delete Portfolio Confirmation Modal */}
        {isOwner && deletingPortfolio && (
          <DeleteConfirmationModal
            open={deletingPortfolio}
            onClose={() => setDeletingPortfolio(false)}
            onDelete={handleDeletePortfolio}
            deleting={isDeletingPortfolio}
            title={`Delete "${portfolio.name}"?`}
            deleteButtonText="Delete Portfolio"
            confirmationText="DELETE"
          />
        )}
      </div>
    </PageWrapper>
  );
}

