'use client';

import AddEditPortfolioModal from '@/components/portfolios/AddEditPortfolioModal';
import DeleteConfirmationModal from '@/app/admin-v1/industry-management/DeleteConfirmationModal';
import { Portfolio } from '@/types/portfolio';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PlusIcon, PencilIcon, TrashIcon, FolderIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import Button from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export default function PortfoliosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [deletingPortfolio, setDeletingPortfolio] = useState<Portfolio | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  // Fetch portfolios
  const {
    data: portfoliosData,
    loading: portfoliosLoading,
    reFetchData: refetchPortfolios,
  } = useFetchData<{ portfolios: Portfolio[] }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/portfolios`,
    { skipInitialFetch: !session },
    'Failed to fetch portfolios'
  );

  const { deleteData: deletePortfolio, loading: isDeleting } = useDeleteData({
    successMessage: 'Portfolio deleted successfully!',
    errorMessage: 'Failed to delete portfolio.',
  });

  const portfolios = portfoliosData?.portfolios || [];

  // Show loading or redirect if no session
  if (!session || portfoliosLoading) {
    return <FullPageLoader message="Loading your portfolios..." />;
  }

  const handleDelete = async () => {
    if (!deletingPortfolio) return;

    const result = await deletePortfolio(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/portfolios?id=${deletingPortfolio.id}`);
    if (result) {
      await refetchPortfolios();
      setDeletingPortfolio(null);
    }
  };

  const handlePortfolioSuccess = async () => {
    await refetchPortfolios();
    setEditingPortfolio(null);
    setShowCreateModal(false);
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <FolderIcon className="w-8 h-8 text-blue-500" />
                My Portfolios
              </h1>
              <p className="text-gray-400 mt-1">
                {portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''} • Total holdings across all portfolios
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setShowCreateModal(true)} variant="contained" primary className="flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Create Portfolio
              </Button>
            </div>
          </div>

          {/* Portfolios Grid/List */}
          {portfolios.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <FolderIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No portfolios yet</h3>
              <p className="text-gray-400 mb-4">Start building your investment portfolio to track and manage your holdings.</p>
              <Button onClick={() => setShowCreateModal(true)} variant="contained" primary className="inline-flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Create Your First Portfolio
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio) => (
                <div key={portfolio.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{portfolio.name}</h3>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{portfolio.summary}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button onClick={() => setEditingPortfolio(portfolio)} variant="text" className="text-blue-400 hover:text-blue-300 p-1">
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => setDeletingPortfolio(portfolio)} variant="text" className="text-red-400 hover:text-red-300 p-1">
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm text-gray-400">
                      <span className="font-medium text-white">{portfolio.portfolioTickers?.length || 0}</span> holdings
                    </div>

                    {portfolio.portfolioTickers && portfolio.portfolioTickers.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-300">Top Holdings:</div>
                        <div className="space-y-1">
                          {portfolio.portfolioTickers.slice(0, 3).map((ticker) => (
                            <div key={ticker.id} className="flex justify-between items-center text-sm">
                              <span className="text-gray-300">{ticker.ticker?.symbol || 'Unknown'}</span>
                              <span className="text-gray-400">{ticker.allocation}%</span>
                            </div>
                          ))}
                          {portfolio.portfolioTickers.length > 3 && (
                            <div className="text-sm text-gray-500">+{portfolio.portfolioTickers.length - 3} more holdings</div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-700">
                      <Link href={`/portfolios/${portfolio.id}`} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Portfolio Modal */}
        <AddEditPortfolioModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={handlePortfolioSuccess} />

        {/* Edit Portfolio Modal */}
        {editingPortfolio && (
          <AddEditPortfolioModal
            isOpen={!!editingPortfolio}
            onClose={() => setEditingPortfolio(null)}
            portfolio={editingPortfolio}
            onSuccess={handlePortfolioSuccess}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deletingPortfolio && (
          <DeleteConfirmationModal
            open={!!deletingPortfolio}
            onClose={() => setDeletingPortfolio(null)}
            onDelete={handleDelete}
            deleting={isDeleting}
            title={`Delete "${deletingPortfolio.name}"?`}
            deleteButtonText="Delete Portfolio"
            confirmationText="DELETE"
          />
        )}
      </div>
    </PageWrapper>
  );
}
