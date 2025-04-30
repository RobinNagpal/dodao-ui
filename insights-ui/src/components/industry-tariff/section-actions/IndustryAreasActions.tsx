'use client';

import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';

export interface IndustryAreasActionsProps {
  industryId: string;
  areaIndex?: number;
  areaTitle?: string;
}

export default function IndustryAreasActions({ industryId, areaIndex, areaTitle }: IndustryAreasActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  const sectionName = areaTitle || 'Industry Areas';

  const actions: EllipsisDropdownItem[] = [
    { key: 'regenerate', label: `Regenerate ${sectionName}` },
    { key: 'edit', label: `Edit ${sectionName}` },
  ];

  const { postData, loading: isRegenerating } = usePostData<any, any>({
    successMessage: `${sectionName} regenerated successfully!`,
    errorMessage: `Failed to regenerate ${sectionName}. Please try again.`,
    redirectPath: `/industry-tariff-report/${industryId}/industry-areas`,
  });

  const handleRegenerate = async () => {
    await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-industry-areas`, {
      industry: industryId,
      areaIndex: areaIndex,
      areaTitle: areaTitle,
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
            if (areaIndex !== undefined) {
              router.push(`/industry-tariff-report/${industryId}/edit/industry-areas/${areaIndex}`);
            } else {
              router.push(`/industry-tariff-report/${industryId}/edit/industry-areas`);
            }
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
