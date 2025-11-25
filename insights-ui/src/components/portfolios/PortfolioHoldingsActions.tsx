'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddEditPortfolioTickerModal from '@/components/portfolios/AddEditPortfolioTickerModal';
import DeleteConfirmationModal from '@/app/admin-v1/industry-management/DeleteConfirmationModal';
import PortfolioHoldings from '@/components/portfolios/PortfolioHoldings';
import TickerActions from './PortfolioTickerActions';
import { PortfolioTicker } from '@/types/portfolio';
import { UserTickerList } from '@prisma/client';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useIsOwner } from '@/hooks/useIsOwner';

interface PortfolioHoldingsActionsProps {
  portfolioTickers: PortfolioTicker[];
  listsWithTickers: { list: UserTickerList; tickers: PortfolioTicker[] }[];
  unlistedTickers: PortfolioTicker[];
  portfolioManagerId: string;
  portfolioId: string;
  portfolioManagerUserId: string;
}

export default function PortfolioHoldingsActions({
  portfolioTickers,
  listsWithTickers,
  unlistedTickers,
  portfolioManagerId,
  portfolioId,
  portfolioManagerUserId,
}: PortfolioHoldingsActionsProps) {
  const router = useRouter();
  const isOwner = useIsOwner(portfolioManagerUserId);
  const [editingTicker, setEditingTicker] = useState<PortfolioTicker | null>(null);
  const [deletingTicker, setDeletingTicker] = useState<PortfolioTicker | null>(null);
  const [showAddTickerModal, setShowAddTickerModal] = useState(false);
  const [openListIds, setOpenListIds] = useState<Set<string>>(new Set());

  const { deleteData: deleteTicker, loading: isDeletingTicker } = useDeleteData({
    successMessage: 'Ticker removed from portfolio successfully!',
    errorMessage: 'Failed to remove ticker from portfolio.',
  });

  const handleSuccess = () => {
    setEditingTicker(null);
    setShowAddTickerModal(false);
    // Refresh the page with updated timestamp to trigger server-side refetch
    const url = new URL(window.location.href);
    url.searchParams.set('updatedAt', Date.now().toString());
    router.push(url.toString());
  };

  const handleDeleteTicker = async () => {
    if (!deletingTicker) return;

    const result = await deleteTicker(
      `${getBaseUrl()}/api/${KoalaGainsSpaceId}/portfolio-managers/${portfolioManagerId}/portfolios/${portfolioId}/tickers?id=${deletingTicker.id}`
    );
    if (result) {
      setDeletingTicker(null);
      handleSuccess();
    }
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
    <>
      <PortfolioHoldings
        portfolioTickers={portfolioTickers}
        listsWithTickers={listsWithTickers}
        unlistedTickers={unlistedTickers}
        openListIds={openListIds}
        handleAccordionClick={handleAccordionClick}
        renderTickerActions={(ticker) => <TickerActions ticker={ticker} isOwner={isOwner} onEdit={setEditingTicker} onDelete={setDeletingTicker} />}
      />

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
          onSuccess={handleSuccess}
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
    </>
  );
}
