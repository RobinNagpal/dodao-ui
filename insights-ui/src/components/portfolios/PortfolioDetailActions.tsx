'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import AddEditPortfolioModal from '@/components/portfolios/AddEditPortfolioModal';
import AddEditPortfolioTickerModal from '@/components/portfolios/AddEditPortfolioTickerModal';
import DeleteConfirmationModal from '@/app/admin-v1/industry-management/DeleteConfirmationModal';
import { Portfolio, PortfolioTicker } from '@/types/portfolio';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useIsOwner } from '@/hooks/useIsOwner';

interface PortfolioDetailActionsProps {
  portfolio: Portfolio;
  portfolioManagerId: string;
  portfolioId: string;
}

export default function PortfolioDetailActions({ portfolio, portfolioManagerId, portfolioId }: PortfolioDetailActionsProps) {
  const router = useRouter();
  const isOwner = useIsOwner(portfolio.portfolioManagerProfile?.userId);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [editingTicker, setEditingTicker] = useState<PortfolioTicker | null>(null);
  const [deletingPortfolio, setDeletingPortfolio] = useState<boolean>(false);
  const [showAddTickerModal, setShowAddTickerModal] = useState(false);

  const { deleteData: deletePortfolio, loading: isDeletingPortfolio } = useDeleteData({
    successMessage: 'Portfolio deleted successfully!',
    errorMessage: 'Failed to delete portfolio.',
  });

  const handleSuccess = () => {
    setEditingPortfolio(null);
    setEditingTicker(null);
    setShowAddTickerModal(false);
    // Refresh the page with updated timestamp to trigger server-side refetch
    const url = new URL(window.location.href);
    url.searchParams.set('updatedAt', Date.now().toString());
    router.push(url.toString());
  };

  const handleDeletePortfolio = async () => {
    const result = await deletePortfolio(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/portfolio-managers/${portfolioManagerId}/portfolios/${portfolioId}`);
    if (result) {
      router.push(`/portfolio-managers/profile-details/${portfolioManagerId}`);
    }
  };

  if (!isOwner) {
    return null;
  }

  const actions: EllipsisDropdownItem[] = [
    { key: 'edit-portfolio', label: 'Edit Portfolio' },
    { key: 'add-holding', label: 'Add Holding' },
    { key: 'delete-portfolio', label: 'Delete Portfolio' },
  ];

  return (
    <>
      <EllipsisDropdown
        items={actions}
        className="px-2 py-2"
        onSelect={(key) => {
          if (key === 'edit-portfolio') {
            setEditingPortfolio(portfolio);
            return;
          }

          if (key === 'add-holding') {
            setShowAddTickerModal(true);
            return;
          }

          if (key === 'delete-portfolio') {
            setDeletingPortfolio(true);
            return;
          }
        }}
      />

      {/* Edit Portfolio Modal */}
      {editingPortfolio && (
        <AddEditPortfolioModal
          isOpen={!!editingPortfolio}
          onClose={() => setEditingPortfolio(null)}
          portfolio={editingPortfolio}
          onSuccess={handleSuccess}
          portfolioManagerId={portfolioManagerId}
        />
      )}

      {/* Add/Edit Ticker Modal */}
      <AddEditPortfolioTickerModal
        isOpen={showAddTickerModal || !!editingTicker}
        onClose={() => {
          setShowAddTickerModal(false);
          setEditingTicker(null);
        }}
        portfolioId={portfolioId}
        portfolioTicker={editingTicker}
        onSuccess={handleSuccess}
        portfolioManagerId={portfolioManagerId}
      />

      {/* Delete Portfolio Confirmation Modal */}
      {deletingPortfolio && (
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
    </>
  );
}

// Export functions for use in PortfolioHoldings component
export function usePortfolioTickerActions(portfolioManagerId: string, portfolioId: string) {
  const router = useRouter();
  const [editingTicker, setEditingTicker] = useState<PortfolioTicker | null>(null);
  const [showAddTickerModal, setShowAddTickerModal] = useState(false);

  const handleSuccess = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('updatedAt', Date.now().toString());
    router.push(url.toString());
  };

  return {
    editingTicker,
    setEditingTicker,
    showAddTickerModal,
    setShowAddTickerModal,
    handleSuccess,
  };
}
