'use client';

import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { Ticker } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface TickerTableActionsProps {
  ticker: Ticker;
}
export default function TickerTableActions({ ticker }: TickerTableActionsProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tickerToDelete, setTickerToDelete] = useState<string | null>(null);

  const router = useRouter();

  const handleEdit = (ticker: string) => {
    router.push(`/public-equities/tickers/edit/${ticker}`);
  };

  const handleDeleteClick = (ticker: string) => {
    setTickerToDelete(ticker);
    setShowConfirmModal(true);
  };

  const { loading, deleteData } = useDeleteData<Ticker, null>({
    successMessage: 'Ticker deleted successfully.',
    errorMessage: 'Failed to delete ticker.',
    redirectPath: '/public-equities/tickers',
  });

  const handleConfirmDelete = async () => {
    if (!tickerToDelete) return;
    setShowConfirmModal(false);
    await deleteData(`/api/tickers/${tickerToDelete}`);
    alert('Ticker deleted successfully.');

    setTickerToDelete(null);
  };

  return (
    <div className="flex">
      <IconButton onClick={() => handleEdit(ticker.tickerKey)} iconName={IconTypes.Edit} removeBorder={true} />
      <IconButton onClick={() => handleDeleteClick(ticker.tickerKey)} iconName={IconTypes.Trash} removeBorder={true} loading={loading} />
      {showConfirmModal && (
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Ticker"
          confirmationText="Are you sure you want to delete this ticker?"
          confirming={loading}
          askForTextInput={false}
        />
      )}
    </div>
  );
}
