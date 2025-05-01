'use client';

import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';

export interface FinalConclusionActionsProps {
  industryId: string;
  sectionKey?: string;
}

export default function FinalConclusionActions({ industryId, sectionKey }: FinalConclusionActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  const sectionName = sectionKey
    ? sectionKey === 'positiveImpacts'
      ? 'Positive Impacts'
      : sectionKey === 'negativeImpacts'
      ? 'Negative Impacts'
      : 'Final Statements'
    : 'Final Conclusion';

  const actions: EllipsisDropdownItem[] = [
    { key: 'regenerate', label: `Regenerate ${sectionName}` },
    { key: 'edit', label: `Edit ${sectionName}` },
  ];

  const { postData, loading: isRegenerating } = usePostData<any, any>({
    successMessage: `${sectionName} regenerated successfully!`,
    errorMessage: `Failed to regenerate ${sectionName}. Please try again.`,
    redirectPath: `/industry-tariff-report/${industryId}/final-conclusion`,
  });

  const handleRegenerate = async () => {
    await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-final-conclusion`, {
      industry: industryId,
      sectionKey: sectionKey,
    });
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
            router.push(
              sectionKey
                ? `/industry-tariff-report/${industryId}/edit/final-conclusion/${sectionKey}`
                : `/industry-tariff-report/${industryId}/edit/final-conclusion`
            );
          }
        }}
      />
      {showRegenerateModal && (
        <ConfirmationModal
          open={showRegenerateModal}
          onClose={() => setShowRegenerateModal(false)}
          onConfirm={handleRegenerate}
          title={`Regenerate ${sectionName}`}
          confirmationText={`Are you sure you want to regenerate the ${sectionName.toLowerCase()}? This will replace the current content.`}
          confirming={isRegenerating}
          askForTextInput={false}
        />
      )}
    </>
  );
}
