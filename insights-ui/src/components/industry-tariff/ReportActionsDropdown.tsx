'use client';

import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

export interface ReportActionsDropdownProps {
  reportId: string;
}

export default function ReportActionsDropdown({ reportId }: ReportActionsDropdownProps) {
  const router = useRouter();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const actions: EllipsisDropdownItem[] = [
    { key: 'edit', label: 'Edit Report' },
    { key: 'export', label: 'Export PDF' },
    { key: 'delete', label: 'Delete Report' },
  ];

  const { loading, deleteData } = useDeleteData<any, null>({
    successMessage: 'Report deleted successfully.',
    errorMessage: 'Failed to delete report.',
    redirectPath: '/industry-tariff-report',
  });

  const handleConfirmDelete = async () => {
    await deleteData(`${getBaseUrl()}/api/industry-tariff-reports/${reportId}`);
    setShowConfirmModal(false);
  };

  return (
    <>
      <EllipsisDropdown
        items={actions}
        onSelect={async (key) => {
          if (key === 'edit') {
            router.push(`/industry-tariff-report/${reportId}/edit`);
          } else if (key === 'export') {
            // Handle export functionality
            window.open(`${getBaseUrl()}/api/industry-tariff-reports/${reportId}/export`, '_blank');
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
          title="Delete Industry Tariff Report"
          confirmationText={`Are you sure you want to delete this industry tariff report?`}
          confirming={loading}
          askForTextInput={false}
        />
      )}
    </>
  );
}
