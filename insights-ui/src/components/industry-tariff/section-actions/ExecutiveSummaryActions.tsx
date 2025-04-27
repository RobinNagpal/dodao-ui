'use client';

import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';

export interface ExecutiveSummaryActionsProps {
  industryId: string;
}

export default function ExecutiveSummaryActions({ industryId }: ExecutiveSummaryActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  const actions: EllipsisDropdownItem[] = [
    { key: 'regenerate', label: 'Regenerate Summary' },
    { key: 'edit', label: 'Edit Summary' },
  ];

  const { postData, loading: isRegenerating } = usePostData<any, any>({
    successMessage: 'Executive summary regenerated successfully!',
    errorMessage: 'Failed to regenerate executive summary. Please try again.',
    redirectPath: `/industry-tariff-report/${industryId}/executive-summary`,
  });

  const handleRegenerate = async () => {
    await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-executive-summary`, {});
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
            router.push(`/industry-tariff-report/${industryId}/edit/executive-summary`);
          }
        }}
      />
      {showRegenerateModal && (
        <ConfirmationModal
          open={showRegenerateModal}
          onClose={() => setShowRegenerateModal(false)}
          onConfirm={handleRegenerate}
          title="Regenerate Executive Summary"
          confirmationText="Are you sure you want to regenerate the executive summary? This will replace the current content."
          confirming={isRegenerating}
          askForTextInput={false}
        />
      )}
    </>
  );
}
