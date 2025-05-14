'use client';

import { ReportType } from '@/scripts/industry-tariff-reports/tariff-types';
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
  const [showGenerateSeoModal, setShowGenerateSeoModal] = useState(false);

  const actions: EllipsisDropdownItem[] = [
    { key: 'regenerate', label: `Regenerate Understand Industry Section` },
    { key: 'edit', label: `Edit Understand Industry Section` },
    { key: 'generate-seo', label: 'Generate SEO for Understand Industry' },
  ];

  const { postData, loading: isRegenerating } = usePostData<any, any>({
    successMessage: `Understand Industry Section regenerated successfully!`,
    errorMessage: `Failed to regenerate Understand Industry Section. Please try again.`,
    redirectPath: `/industry-tariff-report/${industryId}/understand-industry`,
  });

  const { postData: generateSeo, loading: isGeneratingSeo } = usePostData<any, any>({
    successMessage: 'SEO for Understand Industry generated successfully!',
    errorMessage: 'Failed to generate SEO for Understand Industry. Please try again.',
    redirectPath: `/industry-tariff-report/${industryId}/understand-industry`,
  });

  const handleRegenerate = async () => {
    await postData(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-understand-industry`, {});
    router.refresh();
    setShowRegenerateModal(false);
  };

  const handleGenerateSeo = async () => {
    // Send data as JSON body
    const request = {
      section: ReportType.UNDERSTAND_INDUSTRY,
    };
    await generateSeo(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/generate-seo-info`, request);
    router.refresh();
    setShowGenerateSeoModal(false);
  };

  return (
    <>
      <EllipsisDropdown
        items={actions}
        onSelect={async (key) => {
          if (key === 'regenerate') {
            setShowRegenerateModal(true);
          } else if (key === 'edit') {
            router.push(`/industry-tariff-report/${industryId}/edit/understand-industry`);
          } else if (key === 'generate-seo') {
            setShowGenerateSeoModal(true);
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
      {showGenerateSeoModal && (
        <ConfirmationModal
          open={showGenerateSeoModal}
          onClose={() => setShowGenerateSeoModal(false)}
          onConfirm={handleGenerateSeo}
          title="Generate SEO for Understand Industry"
          confirmationText="Are you sure you want to generate SEO metadata for the Understand Industry section?"
          confirming={isGeneratingSeo}
          askForTextInput={false}
        />
      )}
    </>
  );
}
