'use client';

import { EvaluateIndustryContent } from '@/scripts/industry-tariff-reports/tariff-types';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import EllipsisDropdown, { type EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface EvaluateIndustryAreasActionsProps {
  industryId: string;
  sectionName: string;
  headingIndex: number;
  subHeadingIndex: number;
  sectionType?: EvaluateIndustryContent;
}

export default function EvaluateIndustryAreasActions({
  industryId,
  sectionName,
  headingIndex,
  subHeadingIndex,
  sectionType = EvaluateIndustryContent.ALL,
}: EvaluateIndustryAreasActionsProps) {
  const router = useRouter();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  const actions: EllipsisDropdownItem[] = [
    { key: 'regenerate', label: `Regenerate ${sectionName}` },
    { key: 'edit', label: `Edit ${sectionName}` },
  ];

  const { postData, loading: isRegenerating } = usePostData<any, any>({
    successMessage: `${sectionName} regenerated successfully!`,
    errorMessage: `Failed to regenerate ${sectionName}. Please try again.`,
    redirectPath: `/industry-tariff-report/${industryId}/evaluate-industry-areas/${headingIndex}-${subHeadingIndex}`,
  });

  const handleRegenerate = async () => {
    const request = {
      date: new Date().toISOString().split('T')[0],
      headingIndex,
      subHeadingIndex,
      sectionType,
    };
    await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-evaluate-industry-area`, request);
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
            router.push(`/industry-tariff-report/${industryId}/edit/evaluate-industry-areas/${headingIndex}-${subHeadingIndex}`);
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
