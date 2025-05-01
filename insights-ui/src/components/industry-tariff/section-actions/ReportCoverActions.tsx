'use client';

import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';

export interface ReportCoverActionsProps {
  industryId: string;
}

export default function ReportCoverActions({ industryId }: ReportCoverActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  const actions: EllipsisDropdownItem[] = [
    { key: 'regenerate', label: 'Regenerate Cover' },
    { key: 'edit', label: 'Edit Cover' },
  ];

  const { postData, loading: isRegenerating } = usePostData<any, any>({
    successMessage: 'Report cover regenerated successfully!',
    errorMessage: 'Failed to regenerate report cover. Please try again.',
    redirectPath: `/industry-tariff-report/${industryId}/report-cover`,
  });

  const handleRegenerate = async () => {
    await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-report-cover`, {});
    router.refresh();
    setShowRegenerateModal(false);
  };

  return (
    <>
      <EllipsisDropdown
        items={actions}
        onSelect={async (key) => {
          if (key === 'regenerate') {
            setShowRegenerateModal(true);
          } else if (key === 'edit') {
            router.push(`/industry-tariff-report/${industryId}/edit/report-cover`);
          }
        }}
      />
      {showRegenerateModal && (
        <ConfirmationModal
          open={showRegenerateModal}
          onClose={() => setShowRegenerateModal(false)}
          onConfirm={handleRegenerate}
          title="Regenerate Report Cover"
          confirmationText="Are you sure you want to regenerate the report cover? This will replace the current content."
          confirming={isRegenerating}
          askForTextInput={false}
        />
      )}
    </>
  );
}
