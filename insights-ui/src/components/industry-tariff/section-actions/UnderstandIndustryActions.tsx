'use client';

import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';

export interface UnderstandIndustryActionsProps {
  industryId: string;
}

export default function UnderstandIndustryActions({ industryId }: UnderstandIndustryActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  const actions: EllipsisDropdownItem[] = [
    { key: 'regenerate', label: `Regenerate Understand Industry Section` },
    { key: 'edit', label: `Edit Understand Industry Section` },
  ];

  const { postData, loading: isRegenerating } = usePostData<any, any>({
    successMessage: `Understand Industry Section regenerated successfully!`,
    errorMessage: `Failed to regenerate Understand Industry Section. Please try again.`,
    redirectPath: `/industry-tariff-report/${industryId}/understand-industry`,
  });

  const handleRegenerate = async () => {
    await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-understand-industry`, {});
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
          }
        }}
      />
      {showRegenerateModal && (
        <ConfirmationModal
          open={showRegenerateModal}
          onClose={() => setShowRegenerateModal(false)}
          onConfirm={handleRegenerate}
          title={`Regenerate Understand Industry Section`}
          confirmationText={`Are you sure you want to regenerate the Understand Industry Section? This will replace the current content.`}
          confirming={isRegenerating}
          askForTextInput={false}
        />
      )}
    </>
  );
}
