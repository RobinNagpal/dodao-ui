'use client';

import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Ticker } from '@prisma/client';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

export interface ReportActionsDropdownProps {
  tickerKey: string;
}

export default function TickerActionsDropdown({ tickerKey }: ReportActionsDropdownProps) {
  const router = useRouter();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const actions: EllipsisDropdownItem[] = [
    { key: 'debug', label: 'Debug Page' },
    { key: 'edit', label: 'Edit Page' },
    { key: 'delete', label: 'Delete' },
  ];

  const { loading, deleteData } = useDeleteData<Ticker, null>({
    successMessage: 'Ticker deleted successfully.',
    errorMessage: 'Failed to delete ticker.',
    redirectPath: '/public-equities/tickers',
  });

  const handleConfirmDelete = async () => {
    await deleteData(`${getBaseUrl()}/api/tickers/${tickerKey}`);
    setShowConfirmModal(false);
  };

  return (
    <>
      <EllipsisDropdown
        items={actions}
        onSelect={async (key) => {
          if (key === 'debug') {
            router.push(`/public-equities/debug/tickers/${tickerKey}`);
          } else if (key === 'edit') {
            router.push(`/public-equities/tickers/${tickerKey}/edit`);
          } else if (key === 'delete') {
            setShowConfirmModal(true);
          }
        }}
      />
      {showConfirmModal && (
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Ticker"
          confirmationText={`Are you sure you want to delete all records of ${tickerKey}?`}
          confirming={loading}
          askForTextInput={false}
        />
      )}
    </>
  );
}
